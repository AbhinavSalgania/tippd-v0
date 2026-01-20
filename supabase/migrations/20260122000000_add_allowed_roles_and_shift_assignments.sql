begin;

create extension if not exists pgcrypto;

create table if not exists public.employee_allowed_roles (
  employee_id uuid not null references public.employees(id) on delete cascade,
  role text not null,
  constraint employee_allowed_roles_role_check
    check (role in ('server', 'bartender', 'kitchen', 'kitchen_manager', 'manager')),
  constraint employee_allowed_roles_pkey primary key (employee_id, role)
);

create table if not exists public.shift_assignments (
  id uuid primary key default gen_random_uuid(),
  service_period_id uuid not null references public.service_periods(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  worked_role text not null,
  station text null,
  created_at timestamptz not null default now(),
  constraint shift_assignments_worked_role_check check (worked_role in ('server', 'bartender')),
  constraint shift_assignments_unique_worker unique (service_period_id, employee_id)
);

create index if not exists shift_assignments_service_period_id_idx
  on public.shift_assignments (service_period_id);

create index if not exists shift_assignments_employee_id_idx
  on public.shift_assignments (employee_id);

create or replace function public.check_shift_assignment_role_allowed()
returns trigger as $$
begin
  if not exists (
    select 1
    from public.employee_allowed_roles
    where employee_id = new.employee_id
      and role = new.worked_role
  ) then
    raise exception 'Employee % is not allowed to work role %', new.employee_id, new.worked_role;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger shift_assignments_role_allowed_tr
before insert or update of employee_id, worked_role on public.shift_assignments
for each row
execute function public.check_shift_assignment_role_allowed();

commit;
