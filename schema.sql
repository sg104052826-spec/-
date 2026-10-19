-- Company Window Status: database schema and initial data
-- Run this entire file in Supabase Dashboard > SQL Editor > New query.
-- All 45 windows are inserted as CLOSED. Existing rows are not overwritten on rerun.

create table if not exists public.window_status (
  id text primary key,
  zone_id text not null,
  floor text not null,
  area text not null,
  label text not null,
  wall text not null,
  is_open boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'System'
);

create index if not exists window_status_zone_idx on public.window_status(zone_id);

alter table public.window_status enable row level security;

-- Public-link mode: no user accounts. Anyone who can reach the site/API can read and update.
-- This is convenient but is NOT access control; see README for the implications.
drop policy if exists "Signed-in coworkers can view window status" on public.window_status;
drop policy if exists "Signed-in coworkers can update window status" on public.window_status;
drop policy if exists "Public link can view window status" on public.window_status;
create policy "Public link can view window status"
  on public.window_status for select
  to anon, authenticated
  using (true);

drop policy if exists "Public link can update window status" on public.window_status;
create policy "Public link can update window status"
  on public.window_status for update
  to anon, authenticated
  using (true)
  with check (true);

-- Add all rows once. ON CONFLICT preserves existing states if you run this again.
insert into public.window_status (id, zone_id, floor, area, label, wall, is_open, updated_by)
values
  ('1m-gym-A','1m-gym','1M','健身房','A','整排',false,'System'),
  ('1m-gym-B','1m-gym','1M','健身房','B','整排',false,'System'),
  ('1m-gym-C','1m-gym','1M','健身房','C','整排',false,'System'),
  ('1m-gym-D','1m-gym','1M','健身房','D','整排',false,'System'),
  ('1m-gym-E','1m-gym','1M','健身房','E','整排',false,'System'),
  ('1m-gym-F','1m-gym','1M','健身房','F','整排',false,'System'),
  ('2f-lobby-A','2f-lobby','2F','大廳','A','左側牆壁',false,'System'),
  ('2f-lobby-B','2f-lobby','2F','大廳','B','左側牆壁',false,'System'),
  ('2f-lobby-C','2f-lobby','2F','大廳','C','左側牆壁',false,'System'),
  ('2f-lobby-D','2f-lobby','2F','大廳','D','右側牆壁',false,'System'),
  ('2f-lobby-E','2f-lobby','2F','大廳','E','右側牆壁',false,'System'),
  ('2f-factory-A','2f-factory','2F','廠房','A','左側牆壁',false,'System'),
  ('2f-factory-B','2f-factory','2F','廠房','B','左側牆壁',false,'System'),
  ('2f-factory-C','2f-factory','2F','廠房','C','左側牆壁',false,'System'),
  ('2f-factory-D','2f-factory','2F','廠房','D','左側牆壁',false,'System'),
  ('2f-factory-E','2f-factory','2F','廠房','E','左側牆壁',false,'System'),
  ('2f-factory-F','2f-factory','2F','廠房','F','左側牆壁',false,'System'),
  ('2f-factory-G','2f-factory','2F','廠房','G','右側牆壁',false,'System'),
  ('2f-factory-H','2f-factory','2F','廠房','H','右側牆壁',false,'System'),
  ('2f-factory-I','2f-factory','2F','廠房','I','右側牆壁',false,'System'),
  ('2f-factory-J','2f-factory','2F','廠房','J','右側牆壁',false,'System'),
  ('2f-factory-K','2f-factory','2F','廠房','K','右側牆壁',false,'System'),
  ('2f-factory-L','2f-factory','2F','廠房','L','右側牆壁',false,'System'),
  ('3f-lobby-A','3f-lobby','3F','大廳','A','左側牆壁',false,'System'),
  ('3f-lobby-B','3f-lobby','3F','大廳','B','左側牆壁',false,'System'),
  ('3f-lobby-C','3f-lobby','3F','大廳','C','左側牆壁',false,'System'),
  ('3f-lobby-D','3f-lobby','3F','大廳','D','右側牆壁',false,'System'),
  ('3f-lobby-E','3f-lobby','3F','大廳','E','右側牆壁',false,'System'),
  ('4f-general-A','4f-general','4F','一般區域','A','左側牆壁',false,'System'),
  ('4f-general-B','4f-general','4F','一般區域','B','左側牆壁',false,'System'),
  ('4f-general-C','4f-general','4F','一般區域','C','左側牆壁',false,'System'),
  ('4f-general-D','4f-general','4F','一般區域','D','右側牆壁',false,'System'),
  ('4f-general-E','4f-general','4F','一般區域','E','右側牆壁',false,'System'),
  ('4f-meeting-A','4f-meeting','4F','會議廳','A','左側牆壁',false,'System'),
  ('4f-meeting-B','4f-meeting','4F','會議廳','B','左側牆壁',false,'System'),
  ('4f-meeting-C','4f-meeting','4F','會議廳','C','左側牆壁',false,'System'),
  ('4f-meeting-D','4f-meeting','4F','會議廳','D','左側牆壁',false,'System'),
  ('4f-meeting-E','4f-meeting','4F','會議廳','E','左側牆壁',false,'System'),
  ('4f-meeting-F','4f-meeting','4F','會議廳','F','左側牆壁',false,'System'),
  ('4f-meeting-G','4f-meeting','4F','會議廳','G','右側牆壁',false,'System'),
  ('4f-meeting-H','4f-meeting','4F','會議廳','H','右側牆壁',false,'System'),
  ('4f-meeting-I','4f-meeting','4F','會議廳','I','右側牆壁',false,'System'),
  ('4f-meeting-J','4f-meeting','4F','會議廳','J','右側牆壁',false,'System'),
  ('4f-meeting-K','4f-meeting','4F','會議廳','K','右側牆壁',false,'System'),
  ('4f-meeting-L','4f-meeting','4F','會議廳','L','右側牆壁',false,'System')
on conflict (id) do nothing;

-- Enable Realtime updates for the app.
do $$
begin
  alter publication supabase_realtime add table public.window_status;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'Publication supabase_realtime not found; enable Realtime for window_status in Database > Replication.';
end $$;