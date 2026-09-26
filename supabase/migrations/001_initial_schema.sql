-- ============================================================
-- Nexa — Initial Database Schema
-- Run this in your Supabase SQL Editor or as a migration
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ===================== PROJECTS =====================

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid, -- will reference auth.users once auth is enabled
  created_at timestamptz not null default now()
);

create index idx_projects_owner on projects(owner_id);

-- ===================== MEETINGS =====================

create table if not exists meetings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null default 'Untitled Meeting',
  date timestamptz not null default now(),
  transcript text,
  mom_json jsonb,
  audio_url text,
  created_at timestamptz not null default now()
);

create index idx_meetings_project on meetings(project_id);
create index idx_meetings_date on meetings(date desc);

-- ===================== TASKS =====================

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  description text not null,
  owner text,
  due_date date,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_project on tasks(project_id);
create index idx_tasks_meeting on tasks(meeting_id);
create index idx_tasks_status on tasks(status);
create index idx_tasks_due_date on tasks(due_date);
create index idx_tasks_project_status on tasks(project_id, status);

-- ===================== TRIGGERS =====================

-- Auto-update updated_at on task changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at_column();

-- ===================== VIEWS =====================

-- Project stats view for dashboard
create or replace view project_stats as
select
  p.id as project_id,
  p.name as project_name,
  p.created_at,
  count(distinct m.id) as meeting_count,
  count(t.id) as total_tasks,
  count(t.id) filter (where t.status = 'pending') as pending_tasks,
  count(t.id) filter (where t.status = 'completed') as completed_tasks,
  count(t.id) filter (where t.status = 'overdue') as overdue_tasks
from projects p
left join meetings m on m.project_id = p.id
left join tasks t on t.project_id = p.id
group by p.id, p.name, p.created_at;
