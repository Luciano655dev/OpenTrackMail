-- Apply the new first-request heuristic consistently to existing history.
-- The earliest raw event for every tracked email is retained but never counted.
with first_events as (
  select distinct on (tracked_email_id) id
  from public.open_events
  order by tracked_email_id, detected_at, id
)
update public.open_events
set classification = 'early_automatic', is_duplicate = false
where id in (select id from first_events);

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
  );
