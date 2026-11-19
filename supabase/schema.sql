-- HRMS schema with role-based access enforced server-side via RLS

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','hr','manager','interviewer','employee')),
  employee_id uuid,
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  emp_id text unique not null,
  name text not null,
  title text not null,
  org_unit text not null,
  manager_id uuid references employees(id),
  joining_date date not null,
  status text not null default 'active' check (status in ('active','on_leave','exited','contract_ending')),
  contract_end date,
  exit_reason text,
  office_email text,
  personal_email text,
  phone text,
  employment_type text not null default 'full_time' check (employment_type in ('full_time','contract')),
  created_at timestamptz default now()
);

create table if not exists exit_forms (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  filed_by_manager_id uuid references employees(id) not null,
  exit_reason text not null,
  last_working_day date not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists transfer_forms (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  new_org_unit text,
  new_title text,
  new_manager_id uuid references employees(id),
  reason text not null,
  feedback text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table if not exists job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  org_unit text not null,
  vacancies int not null default 1,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz default now()
);

create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  job_opening_id uuid references job_openings(id) not null,
  candidate_name text not null,
  candidate_email text not null,
  candidate_phone text,
  resume_url text,
  status text not null default 'new' check (status in ('new','in_review','rejected','duplicate_rejected','hired')),
  created_at timestamptz default now()
);

-- auto-reject duplicate applications to the same position
create or replace function reject_duplicate_application()
returns trigger as $$
begin
  if exists (
    select 1 from job_applications
    where job_opening_id = new.job_opening_id
      and candidate_email = new.candidate_email
      and status <> 'duplicate_rejected'
      and id <> new.id
  ) then
    new.status := 'duplicate_rejected';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reject_duplicate_application on job_applications;
create trigger trg_reject_duplicate_application
before insert on job_applications
for each row execute function reject_duplicate_application();

create table if not exists interview_entries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references job_applications(id) not null,
  candidate_email text not null,
  interviewer_id uuid references profiles(id) not null,
  round int not null default 1,
  outcome text not null default 'pending' check (outcome in ('pending','passed','rejected')),
  feedback text,
  created_at timestamptz default now()
);

create table if not exists walkin_candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  position_applied text not null,
  queue_status text not null default 'waiting' check (queue_status in ('waiting','in_progress','done')),
  created_at timestamptz default now()
);

-- Row Level Security
alter table employees enable row level security;
alter table exit_forms enable row level security;
alter table transfer_forms enable row level security;
alter table job_openings enable row level security;
alter table job_applications enable row level security;
alter table interview_entries enable row level security;
alter table walkin_candidates enable row level security;
alter table profiles enable row level security;

create or replace function current_role_name()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql stable;

-- Everyone authenticated can view the dashboard/directory
create policy "view employees" on employees for select using (auth.uid() is not null);
create policy "admin/hr edit employees" on employees for all using (current_role_name() in ('admin','hr'));

create policy "view exit forms" on exit_forms for select using (auth.uid() is not null);
create policy "manager/admin/hr file exit forms" on exit_forms for insert with check (current_role_name() in ('admin','hr','manager'));
create policy "admin/hr update exit forms" on exit_forms for update using (current_role_name() in ('admin','hr'));

create policy "view transfer forms" on transfer_forms for select using (auth.uid() is not null);
create policy "manager/admin/hr file transfer forms" on transfer_forms for insert with check (current_role_name() in ('admin','hr','manager'));
create policy "admin/hr update transfer forms" on transfer_forms for update using (current_role_name() in ('admin','hr'));

create policy "view job openings" on job_openings for select using (auth.uid() is not null);
create policy "admin/hr manage job openings" on job_openings for all using (current_role_name() in ('admin','hr'));

create policy "view applications" on job_applications for select using (auth.uid() is not null);
create policy "admin/hr manage applications" on job_applications for all using (current_role_name() in ('admin','hr'));

create policy "view interviews" on interview_entries for select using (auth.uid() is not null);
create policy "interviewer/admin/hr write interviews" on interview_entries for insert with check (current_role_name() in ('admin','hr','interviewer'));
create policy "interviewer/admin/hr update own interviews" on interview_entries for update using (current_role_name() in ('admin','hr') or (current_role_name() = 'interviewer' and interviewer_id = auth.uid()));

create policy "view walkins" on walkin_candidates for select using (auth.uid() is not null);
create policy "admin/hr manage walkins" on walkin_candidates for all using (current_role_name() in ('admin','hr'));

create policy "view own profile or admin" on profiles for select using (auth.uid() = id or current_role_name() = 'admin');
create policy "admin manage profiles" on profiles for all using (current_role_name() = 'admin');
