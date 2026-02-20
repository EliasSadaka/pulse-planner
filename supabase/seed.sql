-- Seed script for local QA (run after creating auth users manually)
-- Replace emails with accounts that exist in auth.users.

insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name;

do $$
declare
  creator uuid;
begin
  select id into creator from public.profiles order by created_at asc limit 1;

  if creator is not null then
    insert into public.events (
      creator_id,
      title,
      description,
      location,
      starts_at,
      ends_at,
      timezone,
      is_public
    ) values (
      creator,
      'PulsePlanner Demo Kickoff',
      'Walkthrough of the MVP and invite flow.',
      'Online',
      timezone('utc', now()) + interval '2 day',
      timezone('utc', now()) + interval '2 day 1 hour',
      'UTC',
      true
    )
    on conflict do nothing;
  end if;
end $$;
