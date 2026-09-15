create index if not exists profiles_created_at_idx on public.profiles(created_at);
create index if not exists tracked_emails_created_at_idx on public.tracked_emails(created_at);

create or replace function public.get_public_daily_stats(p_days integer default 30)
returns table(day date, account_count bigint, tracked_email_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select
      (now() at time zone 'UTC')::date as today,
      least(greatest(coalesce(p_days, 30), 1), 90) as day_count
  ),
  days as (
    select generate_series(today - (day_count - 1), today, interval '1 day')::date as day
    from bounds
  ),
  accounts as (
    select (created_at at time zone 'UTC')::date as day, count(*) as count
    from public.profiles, bounds
    where created_at >= (today - (day_count - 1))::timestamptz
    group by 1
  ),
  emails as (
    select (created_at at time zone 'UTC')::date as day, count(*) as count
    from public.tracked_emails, bounds
    where created_at >= (today - (day_count - 1))::timestamptz
    group by 1
  )
  select days.day, coalesce(accounts.count, 0), coalesce(emails.count, 0)
  from days
  left join accounts using (day)
  left join emails using (day)
  order by days.day;
$$;

revoke all on function public.get_public_daily_stats(integer) from public, anon, authenticated;
grant execute on function public.get_public_daily_stats(integer) to service_role;

