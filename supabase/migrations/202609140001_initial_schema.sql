create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_tracking boolean not null default true,
  open_notifications boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.tracked_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracking_id text not null unique check (tracking_id ~ '^[A-Za-z0-9_-]{32}$'),
  provider text not null default 'gmail' check (provider in ('gmail', 'outlook', 'generic')),
  provider_message_id text,
  provider_thread_id text,
  client_message_id uuid,
  subject text not null default '(no subject)' check (char_length(subject) <= 998),
  recipients text[] not null check (cardinality(recipients) between 1 and 100),
  recipients_text text not null,
  sent_at timestamptz not null default now(),
  open_count integer not null default 0 check (open_count >= 0),
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_message_id)
);

create table public.open_events (
  id uuid primary key default gen_random_uuid(),
  tracked_email_id uuid not null references public.tracked_emails(id) on delete cascade,
  detected_at timestamptz not null default now(),
  user_agent text not null check (char_length(user_agent) <= 512),
  user_agent_class text not null default 'other',
  source_hash text not null check (char_length(source_hash) = 64),
  is_duplicate boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.api_rate_limits (
  rate_key text not null check (char_length(rate_key) <= 128),
  bucket text not null check (char_length(bucket) <= 40),
  window_start timestamptz not null default now(),
  request_count integer not null default 1,
  primary key (rate_key, bucket)
);

create index tracked_emails_user_sent_idx on public.tracked_emails(user_id, sent_at desc);
create index tracked_emails_user_message_idx on public.tracked_emails(user_id, provider_message_id) where provider_message_id is not null;
create index tracked_emails_user_thread_idx on public.tracked_emails(user_id, provider_thread_id) where provider_thread_id is not null;
create index tracked_emails_search_idx on public.tracked_emails using gin(to_tsvector('simple', subject || ' ' || recipients_text));
create index open_events_email_detected_idx on public.open_events(tracked_email_id, detected_at desc);
create index open_events_dedupe_idx on public.open_events(tracked_email_id, source_hash, detected_at desc);

create or replace function public.consume_api_rate_limit(p_rate_key text, p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
  if char_length(p_rate_key) > 128 or char_length(p_bucket) > 40 or p_limit < 1 or p_window_seconds not between 1 and 3600 then return false; end if;
  insert into public.api_rate_limits(rate_key,bucket,window_start,request_count)
  values(p_rate_key,p_bucket,clock_timestamp(),1)
  on conflict(rate_key,bucket) do update set
    window_start = case when public.api_rate_limits.window_start < clock_timestamp() - make_interval(secs => p_window_seconds) then clock_timestamp() else public.api_rate_limits.window_start end,
    request_count = case when public.api_rate_limits.window_start < clock_timestamp() - make_interval(secs => p_window_seconds) then 1 else public.api_rate_limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text,text,integer,integer) to service_role;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute function public.set_updated_at();
create trigger tracked_emails_updated_at before update on public.tracked_emails for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(user_id, email) values (new.id, coalesce(new.email, ''));
  insert into public.settings(user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.classify_user_agent(value text)
returns text language sql immutable set search_path = '' as $$
  select case
    when lower(value) like '%googleimageproxy%' then 'gmail-proxy'
    when lower(value) like '%outlook%' or lower(value) like '%microsoft office%' then 'outlook'
    when lower(value) like '%applewebkit%' then 'webkit'
    when lower(value) like '%mozilla%' then 'browser'
    else 'other'
  end;
$$;

create or replace function public.record_open_event(p_tracking_id text, p_user_agent text, p_source_hash text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_id uuid;
  duplicate_request boolean;
  recent_count integer;
  detected timestamptz := clock_timestamp();
begin
  if p_tracking_id !~ '^[A-Za-z0-9_-]{32}$' or char_length(p_user_agent) > 512 or char_length(p_source_hash) <> 64 then
    return 'invalid';
  end if;

  -- Serialize requests for one email so simultaneous proxy loads cannot both bypass deduplication.
  select id into email_id from public.tracked_emails where tracking_id = p_tracking_id for update;
  if email_id is null then return 'unknown'; end if;

  -- Safety limit per opaque ID. The pixel still returns, but obvious request floods are not stored.
  select count(*) into recent_count from public.open_events where tracked_email_id = email_id and detected_at > detected - interval '1 minute';
  if recent_count >= 120 then return 'rate_limited'; end if;

  -- Heuristic: identical apparent sources inside 10 seconds are part of one open.
  -- We keep the raw row with is_duplicate=true so the window can be improved later.
  select exists(
    select 1 from public.open_events
    where tracked_email_id = email_id and source_hash = p_source_hash and detected_at > detected - interval '10 seconds'
  ) into duplicate_request;

  insert into public.open_events(tracked_email_id, detected_at, user_agent, user_agent_class, source_hash, is_duplicate)
  values (email_id, detected, p_user_agent, public.classify_user_agent(p_user_agent), p_source_hash, duplicate_request);

  if not duplicate_request then
    update public.tracked_emails set
      open_count = open_count + 1,
      first_opened_at = coalesce(first_opened_at, detected),
      last_opened_at = detected
    where id = email_id;
  end if;
  return case when duplicate_request then 'duplicate' else 'recorded' end;
end;
$$;

revoke all on function public.record_open_event(text, text, text) from public, anon, authenticated;
grant execute on function public.record_open_event(text, text, text) to service_role;

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.tracked_emails enable row level security;
alter table public.open_events enable row level security;
alter table public.api_rate_limits enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "settings_select_own" on public.settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "settings_update_own" on public.settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tracked_emails_select_own" on public.tracked_emails for select to authenticated using ((select auth.uid()) = user_id);
create policy "tracked_emails_insert_own" on public.tracked_emails for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tracked_emails_update_own" on public.tracked_emails for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tracked_emails_delete_own" on public.tracked_emails for delete to authenticated using ((select auth.uid()) = user_id);
create policy "open_events_select_own" on public.open_events for select to authenticated using (
  exists(select 1 from public.tracked_emails email where email.id = tracked_email_id and email.user_id = (select auth.uid()))
);

grant select, update on public.profiles to authenticated;
grant select, update on public.settings to authenticated;
grant select, insert, update, delete on public.tracked_emails to authenticated;
grant select on public.open_events to authenticated;
