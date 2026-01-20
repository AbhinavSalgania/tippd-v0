-- Add 'manager' role to the employees role constraint
-- This allows full admin access to FOH entry/compute/summary pages

begin;

-- Drop the existing constraint
alter table public.employees
  drop constraint if exists employees_role_check;

-- Add the updated constraint with 'manager' role
alter table public.employees
  add constraint employees_role_check
    check (role in ('server', 'bartender', 'kitchen', 'kitchen_manager', 'manager'));

commit;
