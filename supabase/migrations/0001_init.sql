-- Utgifter: own schema (isolated from the other apps living in this project,
-- e.g. maxi-yatzy's public.profiles), RLS scoped to household membership.
-- No auth.users-level signup gate here — this project's auth is shared across
-- apps, so access control lives entirely in household_members/RLS instead.

create schema if not exists utgifter;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table utgifter.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table utgifter.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Vårt hushåll',
  created_at timestamptz not null default now()
);

create table utgifter.household_members (
  household_id uuid not null references utgifter.households (id) on delete cascade,
  -- References utgifter.profiles (not auth.users directly) so PostgREST can
  -- embed display_name via a real foreign key when listing a household's roster.
  user_id uuid not null references utgifter.profiles (id) on delete cascade,
  primary key (household_id, user_id)
);

create table utgifter.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references utgifter.households (id) on delete cascade,
  category text not null,
  amount integer not null check (amount > 0),
  payer_id uuid not null references utgifter.profiles (id),
  note text,
  created_at timestamptz not null default now()
);

create index expenses_household_created_idx on utgifter.expenses (household_id, created_at desc);

-- Required for the app's live-update subscription (postgres_changes on INSERT)
-- to actually fire — table membership in this publication is what Realtime watches.
alter publication supabase_realtime add table utgifter.expenses;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table utgifter.profiles enable row level security;
alter table utgifter.households enable row level security;
alter table utgifter.household_members enable row level security;
alter table utgifter.expenses enable row level security;

-- security definer helper avoids self-referential RLS recursion on household_members.
create function utgifter.is_household_member(hid uuid)
returns boolean
language sql
security definer
stable
set search_path = utgifter
as $$
  select exists (
    select 1 from utgifter.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

-- profiles: only readable by someone who shares a household with that profile.
create policy "members can read profiles in their household"
  on utgifter.profiles for select
  to authenticated
  using (
    exists (
      select 1 from utgifter.household_members hm
      where hm.user_id = profiles.id
        and utgifter.is_household_member(hm.household_id)
    )
  );

create policy "users can update their own profile"
  on utgifter.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- household_members: only visible to members of that same household.
create policy "members can see their household roster"
  on utgifter.household_members for select
  to authenticated
  using (utgifter.is_household_member(household_id));

-- expenses: scoped to household membership. Insert + select only for now,
-- matching what the app currently does (no edit/delete UI yet).
create policy "members can read their household's expenses"
  on utgifter.expenses for select
  to authenticated
  using (utgifter.is_household_member(household_id));

create policy "members can add expenses to their household"
  on utgifter.expenses for insert
  to authenticated
  with check (utgifter.is_household_member(household_id) and payer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Bootstrap: Emil and Maja's auth accounts already exist in this project
-- (shared with other apps), so the household can be wired up right away
-- instead of waiting for a first sign-in.
-- ---------------------------------------------------------------------------

insert into utgifter.profiles (id, display_name)
select id, initcap(split_part(email, '@', 1))
from auth.users
where email in ('emil.a.sundberg@gmail.com', 'maja.hogvik@gmail.com')
on conflict (id) do nothing;

with new_household as (
  insert into utgifter.households (name) values ('Vårt hushåll')
  returning id
)
insert into utgifter.household_members (household_id, user_id)
select new_household.id, profiles.id
from new_household, utgifter.profiles
where profiles.id in (
  select id from auth.users where email in ('emil.a.sundberg@gmail.com', 'maja.hogvik@gmail.com')
);
