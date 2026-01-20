begin;

truncate table
  public.payout_line_items,
  public.service_period_payouts,
  public.service_period_totals,
  public.service_period_entries,
  public.weekly_kitchen_payouts,
  public.kitchen_work_logs,
  public.shift_assignments,
  public.employee_allowed_roles,
  public.service_periods,
  public.employees
restart identity cascade;

insert into public.employees (employee_code, display_name, pin, is_active, role)
values
  ('S001', 'Server 1', '1111', true, 'server'),
  ('S002', 'Server 2', '2222', true, 'server'),
  ('S003', 'Server 3', '3333', true, 'server'),
  ('S004', 'Server 4', '4444', true, 'server'),
  ('S005', 'Server 5', '5555', true, 'server'),
  ('S006', 'Server 6', '6666', true, 'server'),
  ('S007', 'Server 7', '7777', true, 'server'),
  ('S008', 'Server 8', '8888', true, 'server'),
  ('S009', 'Server 9', '9999', true, 'server'),
  ('S010', 'Server 10', '1010', true, 'server'),
  ('S011', 'Server 11', '1112', true, 'server'),
  ('B001', 'Bartender 1', '1212', true, 'bartender'),
  ('B002', 'Bartender 2', '1313', true, 'bartender'),
  ('B003', 'Bartender 3', '1414', true, 'bartender'),
  ('B004', 'Bartender 4', '1515', true, 'bartender'),
  ('B005', 'Bartender 5', '1616', true, 'bartender');

insert into public.employee_allowed_roles (employee_id, role)
select id, role
from public.employees;

insert into public.employee_allowed_roles (employee_id, role)
select id, 'server'
from public.employees
where employee_code in ('B004', 'B005')
on conflict do nothing;

insert into public.service_periods (period_date, period_type)
values
  ('2026-01-12'::date, 'lunch'),
  ('2026-01-12'::date, 'dinner'),
  ('2026-01-13'::date, 'lunch'),
  ('2026-01-13'::date, 'dinner'),
  ('2026-01-14'::date, 'lunch'),
  ('2026-01-14'::date, 'dinner'),
  ('2026-01-15'::date, 'lunch'),
  ('2026-01-15'::date, 'dinner'),
  ('2026-01-16'::date, 'lunch'),
  ('2026-01-16'::date, 'dinner'),
  ('2026-01-17'::date, 'lunch'),
  ('2026-01-17'::date, 'dinner'),
  ('2026-01-18'::date, 'lunch'),
  ('2026-01-18'::date, 'dinner');

with
  sp as (
    select id, period_date, period_type
    from public.service_periods
  ),
  e as (
    select id, employee_code
    from public.employees
  )
insert into public.shift_assignments (service_period_id, employee_id, worked_role, station)
values
  -- Mon 2026-01-12 lunch
  ((select id from sp where period_date = '2026-01-12'::date and period_type = 'lunch'), (select id from e where employee_code = 'S001'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-12'::date and period_type = 'lunch'), (select id from e where employee_code = 'S002'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-12'::date and period_type = 'lunch'), (select id from e where employee_code = 'B001'), 'bartender', 'Bar 1'),

  -- Mon 2026-01-12 dinner
  ((select id from sp where period_date = '2026-01-12'::date and period_type = 'dinner'), (select id from e where employee_code = 'S003'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-12'::date and period_type = 'dinner'), (select id from e where employee_code = 'S004'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-12'::date and period_type = 'dinner'), (select id from e where employee_code = 'B002'), 'bartender', 'Bar 1'),

  -- Tue 2026-01-13 lunch
  ((select id from sp where period_date = '2026-01-13'::date and period_type = 'lunch'), (select id from e where employee_code = 'S005'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-13'::date and period_type = 'lunch'), (select id from e where employee_code = 'S006'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-13'::date and period_type = 'lunch'), (select id from e where employee_code = 'B003'), 'bartender', 'Bar 1'),

  -- Tue 2026-01-13 dinner
  ((select id from sp where period_date = '2026-01-13'::date and period_type = 'dinner'), (select id from e where employee_code = 'S007'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-13'::date and period_type = 'dinner'), (select id from e where employee_code = 'S008'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-13'::date and period_type = 'dinner'), (select id from e where employee_code = 'B004'), 'bartender', 'Bar 1'),

  -- Wed 2026-01-14 lunch
  ((select id from sp where period_date = '2026-01-14'::date and period_type = 'lunch'), (select id from e where employee_code = 'S009'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-14'::date and period_type = 'lunch'), (select id from e where employee_code = 'S010'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-14'::date and period_type = 'lunch'), (select id from e where employee_code = 'B003'), 'bartender', 'Bar 1'),

  -- Wed 2026-01-14 dinner
  ((select id from sp where period_date = '2026-01-14'::date and period_type = 'dinner'), (select id from e where employee_code = 'S011'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-14'::date and period_type = 'dinner'), (select id from e where employee_code = 'S001'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-14'::date and period_type = 'dinner'), (select id from e where employee_code = 'B001'), 'bartender', 'Bar 1'),

  -- Thu 2026-01-15 lunch
  ((select id from sp where period_date = '2026-01-15'::date and period_type = 'lunch'), (select id from e where employee_code = 'S002'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-15'::date and period_type = 'lunch'), (select id from e where employee_code = 'S003'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-15'::date and period_type = 'lunch'), (select id from e where employee_code = 'B005'), 'bartender', 'Bar 1'),

  -- Thu 2026-01-15 dinner
  ((select id from sp where period_date = '2026-01-15'::date and period_type = 'dinner'), (select id from e where employee_code = 'S004'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-15'::date and period_type = 'dinner'), (select id from e where employee_code = 'S005'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-15'::date and period_type = 'dinner'), (select id from e where employee_code = 'B002'), 'bartender', 'Bar 1'),

  -- Fri 2026-01-16 lunch
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'lunch'), (select id from e where employee_code = 'S006'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'lunch'), (select id from e where employee_code = 'S007'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'lunch'), (select id from e where employee_code = 'S008'), 'server', 'Bar'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'lunch'), (select id from e where employee_code = 'B001'), 'bartender', 'Bar 1'),

  -- Fri 2026-01-16 dinner
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'dinner'), (select id from e where employee_code = 'S009'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'dinner'), (select id from e where employee_code = 'S010'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'dinner'), (select id from e where employee_code = 'B004'), 'server', 'Bar'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'dinner'), (select id from e where employee_code = 'S001'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'dinner'), (select id from e where employee_code = 'B002'), 'bartender', 'Bar 1'),
  ((select id from sp where period_date = '2026-01-16'::date and period_type = 'dinner'), (select id from e where employee_code = 'B003'), 'bartender', 'Bar 2'),

  -- Sat 2026-01-17 lunch
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'lunch'), (select id from e where employee_code = 'S002'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'lunch'), (select id from e where employee_code = 'S003'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'lunch'), (select id from e where employee_code = 'S011'), 'server', 'Bar'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'lunch'), (select id from e where employee_code = 'B005'), 'bartender', 'Bar 1'),

  -- Sat 2026-01-17 dinner
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'dinner'), (select id from e where employee_code = 'S004'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'dinner'), (select id from e where employee_code = 'S005'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'dinner'), (select id from e where employee_code = 'S006'), 'server', 'Bar'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'dinner'), (select id from e where employee_code = 'B005'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'dinner'), (select id from e where employee_code = 'B001'), 'bartender', 'Bar 1'),
  ((select id from sp where period_date = '2026-01-17'::date and period_type = 'dinner'), (select id from e where employee_code = 'B004'), 'bartender', 'Bar 2'),

  -- Sun 2026-01-18 lunch
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'lunch'), (select id from e where employee_code = 'S007'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'lunch'), (select id from e where employee_code = 'S008'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'lunch'), (select id from e where employee_code = 'S009'), 'server', 'Bar'),
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'lunch'), (select id from e where employee_code = 'B003'), 'bartender', 'Bar 1'),

  -- Sun 2026-01-18 dinner
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'dinner'), (select id from e where employee_code = 'B004'), 'server', 'Patio'),
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'dinner'), (select id from e where employee_code = 'B005'), 'server', 'Dining'),
  ((select id from sp where period_date = '2026-01-18'::date and period_type = 'dinner'), (select id from e where employee_code = 'B002'), 'bartender', 'Bar 1');

commit;

select count(*) as employees_count from public.employees;
select count(*) as service_periods_count from public.service_periods;
select count(*) as shift_assignments_count from public.shift_assignments;
select worked_role, count(*) as assignments_count
from public.shift_assignments
group by worked_role
order by worked_role;
select e.employee_code, e.display_name, count(sa.id) as shift_count
from public.employees e
left join public.shift_assignments sa on sa.employee_id = e.id
group by e.employee_code, e.display_name
order by e.employee_code;
