create or replace function public.record_open_event(p_tracking_id text, p_user_agent text, p_source_hash text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_id uuid;
  duplicate_request boolean;
  event_classification text;
  recent_count integer;
  detected timestamptz := clock_timestamp();
begin
  if p_tracking_id !~ '^[A-Za-z0-9_-]{32}$' or char_length(p_user_agent) > 512 or char_length(p_source_hash) <> 64 then
    return 'invalid';
  end if;

  -- Serialize requests for one email so simultaneous proxy loads cannot both
  -- bypass rapid-duplicate handling.
  select id into email_id
  from public.tracked_emails where tracking_id = p_tracking_id for update;
  if email_id is null then return 'unknown'; end if;

  select count(*) into recent_count from public.open_events
  where tracked_email_id = email_id and detected_at > detected - interval '1 minute';
  if recent_count >= 120 then return 'rate_limited'; end if;

  -- The extension blocks this exact pixel URL in the sender's Gmail tab while
  -- Gmail serializes and sends the message. A server-side grace period would
  -- also hide genuine recipient opens, so valid requests can count immediately.
  select exists(
    select 1 from public.open_events
    where tracked_email_id = email_id
      and source_hash = p_source_hash
      and classification = 'counted'
      and detected_at > detected - interval '10 seconds'
  ) into duplicate_request;

  event_classification := case
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
