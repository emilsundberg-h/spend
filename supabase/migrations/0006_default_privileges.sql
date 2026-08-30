-- 0001's `grant ... on all tables in schema utgifter to service_role` only
-- covered tables that existed at the time — hidden_categories (added in
-- 0005) never got it, discovered when even the service role couldn't touch
-- it for cleanup. Fix that gap and make sure it can't recur: default
-- privileges apply the grant automatically to any table created after this,
-- in either the app's own migrations or ad-hoc via the dashboard.

grant select, insert, update, delete on utgifter.hidden_categories to service_role;

alter default privileges in schema utgifter
  grant select, insert, update, delete on tables to service_role;
