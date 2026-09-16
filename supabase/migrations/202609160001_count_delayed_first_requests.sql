-- A first image load long after send is not Gmail's immediate send-time fetch.
-- Keep the short grace period, but count delayed first loads as recipient opens.
create or replace function public.record_open_event(p_tracking_id text, p_user_agent text, p_source_hash text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_id uuid;
  email_sent_at timestamptz;
  has_prior_request boolean;
  duplicate_request boolean;
  event_classification text;
  recent_count integer;
  detected timestamptz := clock_timestamp();
begin
  if p_tracking_id !~ '^[A-Za-z0-9_-]{32}$' or char_length(p_user_agent) > 512 or char_length(p_source_hash) <> 64 then
    return 'invalid';
  end if;

  select id, sent_at into email_id, email_sent_at
  from public.tracked_emails where tracking_id = p_tracking_id for update;
  if email_id is null then return 'unknown'; end if;

  select count(*) into recent_count from public.open_events
  where tracked_email_id = email_id and detected_at > detected - interval '1 minute';
  if recent_count >= 120 then return 'rate_limited'; end if;

  select exists(
    select 1 from public.open_events where tracked_email_id = email_id
  ) into has_prior_request;

  select exists(
    select 1 from public.open_events
    where tracked_email_id = email_id
      and source_hash = p_source_hash
      and classification = 'counted'
      and detected_at > detected - interval '10 seconds'
  ) into duplicate_request;

  event_classification := case
    when not has_prior_request and detected < email_sent_at + interval '60 seconds' then 'early_automatic'
    when duplicate_request then 'rapid_duplicate'
    else 'counted'
  end;

  insert into public.open_events(
    tracked_email_id, detected_at, user_agent, user_agent_class,
    source_hash, is_duplicate, classification
  ) values (
    email_id, detected, p_user_agent, public.classify_user_agent(p_user_agent),
    p_source_hash, duplicate_request, event_classification
  );

  if event_classification = 'counted' then
    update public.tracked_emails set
      open_count = open_count + 1,
      first_opened_at = coalesce(first_opened_at, detected),
      last_opened_at = detected
    where id = email_id;
  end if;

  return event_classification;
end;
$$;

revoke all on function public.record_open_event(text, text, text) from public, anon, authenticated;
grant execute on function public.record_open_event(text, text, text) to service_role;

-- Repair delayed first loads that the previous rule incorrectly discarded.
with delayed_first_events as (
  select distinct on (event.tracked_email_id) event.id
  from public.open_events event
  join public.tracked_emails email on email.id = event.tracked_email_id
  where event.classification = 'early_automatic'
    and event.detected_at >= email.sent_at + interval '60 seconds'
  order by event.tracked_email_id, event.detected_at, event.id
)
update public.open_events
set classification = 'counted', is_duplicate = false
where id in (select id from delayed_first_events);

update public.tracked_emails email set
  open_count = (
    select count(*) from public.open_events event
    where event.tracked_email_id = email.id and event.classification = 'counted'
  ),
  first_opened_at = (
    select min(event.detected_at) from public.open_events event
    where event.tracked_email_id = email.id and event.classification = 'counted'
  ),
  last_opened_at = (
    select max(event.detected_at) from public.open_events event
    where event.tracked_email_id = email.id and event.classification = 'counted'
  )
where exists (
  select 1 from public.open_events event
  where event.tracked_email_id = email.id and event.classification = 'counted'
);
