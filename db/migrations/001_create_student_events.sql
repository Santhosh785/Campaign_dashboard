create table if not exists student_events (
  id bigint generated always as identity primary key,
  name text,
  phone text,
  event_type text,
  time_spent_seconds int,
  scroll_depth_percent int,
  scroll_count int,
  refresh_count int,
  shared boolean,
  timestamp timestamptz,
  created_at timestamptz default now()
);
