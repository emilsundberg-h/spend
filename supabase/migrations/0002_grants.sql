-- RLS policies alone aren't enough — Postgres still requires schema/table-level
-- privileges before RLS even gets evaluated. Tables created via `create schema`
-- outside `public` don't inherit Supabase's usual default grants, which is why
-- PostgREST was returning 403 on every request against `utgifter.*`.

grant usage on schema utgifter to authenticated, service_role;

grant select, update on utgifter.profiles to authenticated;
grant select on utgifter.household_members to authenticated;
grant select, insert on utgifter.expenses to authenticated;

grant select, insert, update, delete on all tables in schema utgifter to service_role;
