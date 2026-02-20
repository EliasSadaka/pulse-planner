-- PulsePlanner V5 schema + RLS
create extension if not exists "pgcrypto";

create type public.attendance_status as enum ('attending', 'maybe', 'declined');
create type public.invite_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint event_time_order check (ends_at > starts_at)
);

create table if not exists public.event_attendance (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.attendance_status not null,
  responded_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id)
);

create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_email text not null,
  invitee_user_id uuid references public.profiles(id) on delete set null,
  token_hash text not null unique,
  status public.invite_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  feature text not null,
  input jsonb,
  output jsonb,
  success boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_events_creator_id on public.events (creator_id);
create index if not exists idx_events_starts_at on public.events (starts_at);
create index if not exists idx_events_public on public.events (is_public);
create index if not exists idx_invites_event_id on public.event_invites (event_id);
create index if not exists idx_invites_email on public.event_invites (invitee_email);
create index if not exists idx_attendance_user on public.event_attendance (user_id);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.event_invites enable row level security;
alter table public.ai_history enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "events_select_visible"
on public.events for select
using (
  is_public = true
  or creator_id = auth.uid()
  or exists (
    select 1 from public.event_invites i
    where i.event_id = events.id
      and (
        i.invitee_user_id = auth.uid()
        or i.invitee_email = (select email from auth.users where id = auth.uid())
      )
  )
  or exists (
    select 1 from public.event_attendance a
    where a.event_id = events.id
      and a.user_id = auth.uid()
  )
);

create policy "events_insert_creator"
on public.events for insert
with check (creator_id = auth.uid());

create policy "events_update_creator"
on public.events for update
using (creator_id = auth.uid())
with check (creator_id = auth.uid());

create policy "events_delete_creator"
on public.events for delete
using (creator_id = auth.uid());

create policy "attendance_select_self_or_creator"
on public.event_attendance for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.events e
    where e.id = event_attendance.event_id
      and e.creator_id = auth.uid()
  )
);

create policy "attendance_insert_self"
on public.event_attendance for insert
with check (user_id = auth.uid());

create policy "attendance_update_self"
on public.event_attendance for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "invites_select_creator_or_invitee"
on public.event_invites for select
using (
  inviter_id = auth.uid()
  or invitee_user_id = auth.uid()
  or invitee_email = (select email from auth.users where id = auth.uid())
);

create policy "invites_insert_creator"
on public.event_invites for insert
with check (
  inviter_id = auth.uid()
  and exists (
    select 1 from public.events e
    where e.id = event_invites.event_id
      and e.creator_id = auth.uid()
  )
);

create policy "invites_update_inviter_or_invitee"
on public.event_invites for update
using (
  inviter_id = auth.uid()
  or invitee_user_id = auth.uid()
  or invitee_email = (select email from auth.users where id = auth.uid())
)
with check (
  inviter_id = auth.uid()
  or invitee_user_id = auth.uid()
  or invitee_email = (select email from auth.users where id = auth.uid())
);

create policy "ai_history_select_own"
on public.ai_history for select
using (user_id = auth.uid());

create policy "ai_history_insert_own"
on public.ai_history for insert
with check (user_id = auth.uid());
