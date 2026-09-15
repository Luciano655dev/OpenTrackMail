alter table public.open_events
  add column classification text not null default 'counted'
  check (classification in ('counted', 'rapid_duplicate', 'early_automatic'));

-- Preserve the old duplicate decision and identify requests that arrived while
-- Gmail or a security scanner was processing the freshly sent message.
update public.open_events set classification = 'rapid_duplicate' where is_duplicate;
update public.open_events event
set classification = 'early_automatic'
from public.tracked_emails email
where event.tracked_email_id = email.id
  and event.detected_at < email.sent_at + interval '15 seconds';

-- Correct existing summaries so earlier sender-side proxy loads stop appearing
-- as recipient opens after this migration is deployed.
update public.tracked_emails email set
  open_count = (select count(*) from public.open_events event where event.tracked_email_id = email.id and event.classification = 'counted'),
  first_opened_at = (select min(event.detected_at) from public.open_events event where event.tracked_email_id = email.id and event.classification = 'counted'),
  last_opened_at = (select max(event.detected_at) from public.open_events event where event.tracked_email_id = email.id and event.classification = 'counted');

create or replace function public.record_open_event(p_tracking_id text, p_user_agent text, p_source_hash text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_id uuid;
  email_sent_at timestamptz;
  duplicate_request boolean;
  automatic_request boolean;
  event_classification text;
  recent_count integer;
  detected timestamptz := clock_timestamp();
begin
  if p_tracking_id !~ '^[A-Za-z0-9_-]{32}$' or char_length(p_user_agent) > 512 or char_length(p_source_hash) <> 64 then
    return 'invalid';
  end if;

  -- Serialize requests for one email so simultaneous proxy loads cannot both
  -- bypass classification or rapid-duplicate handling.
  select id, sent_at into email_id, email_sent_at
  from public.tracked_emails where tracking_id = p_tracking_id for update;
  if email_id is null then return 'unknown'; end if;

  select count(*) into recent_count from public.open_events
  where tracked_email_id = email_id and detected_at > detected - interval '1 minute';
  if recent_count >= 120 then return 'rate_limited'; end if;

  -- Gmail, mail proxies, and security tools commonly request new remote images
  -- as part of send-time processing. Requests inside this deliberately narrow
  -- window are retained but do not claim that the recipient opened the email.
  automatic_request := detected < email_sent_at + interval '15 seconds';

  select exists(
    select 1 from public.open_events
    where tracked_email_id = email_id
      and source_hash = p_source_hash
      and classification = 'counted'
      and detected_at > detected - interval '10 seconds'
  ) into duplicate_request;

  event_classification := case
    when automatic_request then 'early_automatic'
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
