begin;

-- Add employees.role back so UI can filter FOH vs BOH.
alter table public.employees
  add column role text default 'server';

-- Backfill existing rows (safety if any rows pre-exist).
update public.employees
set role = 'server'
where role is null;

-- Constrain allowed roles and require presence.
alter table public.employees
  alter column role set not null,
  add constraint employees_role_check
    check (role in ('server','bartender','kitchen','kitchen_manager'));

-- Speed up role-based filtering.
create index if not exists employees_role_idx on public.employees (role);

commit;
