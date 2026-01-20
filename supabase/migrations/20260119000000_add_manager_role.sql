-- Add 'manager' role for full admin access
-- This separates admin functionality from kitchen_manager (BOH-only access)

begin;

-- Drop the existing constraint and add the new one with 'manager' included
alter table public.employees
  drop constraint if exists employees_role_check;

alter table public.employees
  add constraint employees_role_check
    check (role in ('server', 'bartender', 'kitchen', 'kitchen_manager', 'manager'));

commit;
