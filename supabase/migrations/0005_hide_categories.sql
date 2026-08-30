-- Lets either household member remove a category from the picker. Nothing
-- is ever hard-deleted: hiding a category reassigns its existing expenses
-- to "Övrigt" (atomically, in the same function) and remembers that it's
-- hidden so it stops showing up as a tile — CATEGORIES itself stays a fixed
-- list in code either way.

create table utgifter.hidden_categories (
  household_id uuid not null references utgifter.households (id) on delete cascade,
  category text not null,
  hidden_at timestamptz not null default now(),
  primary key (household_id, category)
);

alter table utgifter.hidden_categories enable row level security;

grant select on utgifter.hidden_categories to authenticated;

create policy "members can see their household's hidden categories"
  on utgifter.hidden_categories for select
  to authenticated
  using (utgifter.is_household_member(household_id));

-- The only way to add a row here — security definer so it can also touch
-- expenses, after checking membership itself. No direct insert/update grant
-- on either table for this path; everything goes through this function.
create function utgifter.hide_category(p_household_id uuid, p_category text)
returns void
language plpgsql
security definer
set search_path = utgifter
as $$
begin
  if not utgifter.is_household_member(p_household_id) then
    raise exception 'not a member of this household';
  end if;
  if p_category = 'Övrigt' then
    raise exception 'cannot hide Övrigt';
  end if;

  update utgifter.expenses
    set category = 'Övrigt'
    where household_id = p_household_id and category = p_category;

  insert into utgifter.hidden_categories (household_id, category)
    values (p_household_id, p_category)
    on conflict (household_id, category) do nothing;
end;
$$;

grant execute on function utgifter.hide_category(uuid, text) to authenticated;
