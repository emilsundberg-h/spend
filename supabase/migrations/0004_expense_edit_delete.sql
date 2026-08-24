-- Lets either household member edit or delete any expense in their
-- household (not just the original submitter) — it's a shared budget, so
-- fixing a typo or removing a duplicate shouldn't require the person who
-- happened to log it originally.

grant update, delete on utgifter.expenses to authenticated;

create policy "members can update their household's expenses"
  on utgifter.expenses for update
  to authenticated
  using (utgifter.is_household_member(household_id))
  with check (utgifter.is_household_member(household_id));

create policy "members can delete their household's expenses"
  on utgifter.expenses for delete
  to authenticated
  using (utgifter.is_household_member(household_id));
