-- Demo data collection tables for the LoreBlock landing/demo flow.
-- Public clients must not access these tables directly. Edge Functions use
-- the service_role key and enforce request validation/admin checks.
create extension if not exists "pgcrypto";
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  sid text not null check (char_length(sid) between 1 and 128),
  type text not null check (
    type in (
      'role_select',
      'demo_open',
      'interest_add',
      'interest_remove',
      'waitlist_submit',
      'submit_interest',
      'enter_demo',
      'app_feature'
    )
  ),
  feature text check (feature is null or char_length(feature) <= 512),
  ts bigint not null check (ts > 0),
  created_at timestamptz not null default now()
);

create index if not exists events_sid_idx on public.events (sid);
create index if not exists events_ts_idx on public.events (ts desc);
create index if not exists events_type_idx on public.events (type);

alter table public.events enable row level security;
alter table public.events force row level security;

revoke all on table public.events from anon, authenticated;
grant select, insert, delete on table public.events to service_role;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  sid text not null check (char_length(sid) between 1 and 128),
  email text not null check (
    char_length(email) <= 320
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  role text check (role is null or char_length(role) <= 100),
  genre text check (genre is null or char_length(genre) <= 100),
  genre_other text check (genre_other is null or char_length(genre_other) <= 100),
  interests text[] not null default '{}',
  ts bigint not null check (ts > 0),
  created_at timestamptz not null default now(),
  check (array_length(interests, 1) is null or array_length(interests, 1) <= 50)
);

create unique index if not exists leads_email_unique_idx on public.leads (lower(email));
create index if not exists leads_sid_idx on public.leads (sid);
create index if not exists leads_ts_idx on public.leads (ts desc);

alter table public.leads enable row level security;
alter table public.leads force row level security;

revoke all on table public.leads from anon, authenticated;
grant select, insert, update on table public.leads to service_role;
