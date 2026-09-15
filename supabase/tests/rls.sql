-- Run with `supabase test db` after `supabase start`.
begin;
select plan(6);
select has_table('public','tracked_emails','tracked_emails exists');
select has_table('public','open_events','open_events exists');
select has_table('public','api_rate_limits','api_rate_limits exists');
select policies_are('public','tracked_emails',array['tracked_emails_delete_own','tracked_emails_insert_own','tracked_emails_select_own','tracked_emails_update_own'],'tracked email RLS policies exist');
select policies_are('public','open_events',array['open_events_select_own'],'open event read policy exists');
select function_privs_are('public','record_open_event',array['text','text','text'],'service_role',array['EXECUTE'],'only the service role is tested for pixel writes');
select * from finish();
rollback;
