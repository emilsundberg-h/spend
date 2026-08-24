-- Lets a purchase carry an editable date (defaults to today) instead of only
-- the insertion timestamp, plus an optional free-text tag for cross-category
-- grouping in the summary view.

alter table utgifter.expenses
  add column expense_date date not null default (now() at time zone 'utc')::date,
  add column tag text;

-- Listing now orders by expense_date first (created_at only as a tiebreaker),
-- so the old created_at-only index no longer matches the query shape.
drop index if exists utgifter.expenses_household_created_idx;
create index expenses_household_date_idx on utgifter.expenses (household_id, expense_date desc, created_at desc);
