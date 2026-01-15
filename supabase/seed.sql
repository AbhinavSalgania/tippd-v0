begin;

-- Employees (2 servers, bartenders, kitchen + kitchen manager)
insert into public.employees (employee_code, display_name, pin, role)
values
  ('S001', 'Server 1', '1111', 'server'),
  ('S002', 'Server 2', '2222', 'server'),
  ('B001', 'Bartender 1', '3333', 'bartender'),
  ('B002', 'Bartender 2', '4444', 'bartender'),
  ('K001', 'Kitchen 1', '5555', 'kitchen'),
  ('KM01', 'Kitchen Manager', '6666', 'kitchen_manager')
on conflict (employee_code) do nothing;

-- Service periods: one lunch + one dinner on same date
insert into public.service_periods (period_date, period_type)
values
  ('2026-01-15'::date, 'lunch'),
  ('2026-01-15'::date, 'dinner')
on conflict (period_date, period_type) do nothing;

-- Helper CTEs for ids
with
  sp_lunch as (
    select id as service_period_id
    from public.service_periods
    where period_date = '2026-01-15'::date and period_type = 'lunch'
    limit 1
  ),
  sp_dinner as (
    select id as service_period_id
    from public.service_periods
    where period_date = '2026-01-15'::date and period_type = 'dinner'
    limit 1
  ),
  e as (
    select employee_code, id as employee_id
    from public.employees
    where employee_code in ('S001','S002','B001','B002','K001','KM01')
  )
insert into public.service_period_entries
  (service_period_id, employee_id, role, bartender_slot, sales_total, tips_collected)
select * from (
  -- Lunch: 2 servers + 1 bartender
  select (select service_period_id from sp_lunch), (select employee_id from e where employee_code='S001'),
         'server', null::smallint, 1100.00::numeric, 210.00::numeric
  union all
  select (select service_period_id from sp_lunch), (select employee_id from e where employee_code='S002'),
         'server', null::smallint, 850.00::numeric, 160.00::numeric
  union all
  select (select service_period_id from sp_lunch), (select employee_id from e where employee_code='B001'),
         'bartender', 1::smallint, 0.00::numeric, 180.00::numeric

  -- Dinner: 2 servers + 2 bartenders (slot 1 + 2)
  union all
  select (select service_period_id from sp_dinner), (select employee_id from e where employee_code='S001'),
         'server', null::smallint, 1400.00::numeric, 260.00::numeric
  union all
  -- Include an under-threshold server to exercise the $150 eligibility rule in app logic
  select (select service_period_id from sp_dinner), (select employee_id from e where employee_code='S002'),
         'server', null::smallint, 120.00::numeric, 20.00::numeric
  union all
  select (select service_period_id from sp_dinner), (select employee_id from e where employee_code='B001'),
         'bartender', 1::smallint, 0.00::numeric, 250.00::numeric
  union all
  select (select service_period_id from sp_dinner), (select employee_id from e where employee_code='B002'),
         'bartender', 2::smallint, 0.00::numeric, 190.00::numeric
) v
on conflict (service_period_id, employee_id) do nothing;

-- Kitchen work logs (entered by kitchen manager later; seeded here as example inputs)
with
  sp_lunch as (
    select id as service_period_id
    from public.service_periods
    where period_date = '2026-01-15'::date and period_type = 'lunch'
    limit 1
  ),
  sp_dinner as (
    select id as service_period_id
    from public.service_periods
    where period_date = '2026-01-15'::date and period_type = 'dinner'
    limit 1
  ),
  e as (
    select employee_code, id as employee_id
    from public.employees
    where employee_code in ('K001','KM01')
  )
insert into public.kitchen_work_logs
  (service_period_id, employee_id, hours_worked, role_weight)
values
  ((select service_period_id from sp_lunch), (select employee_id from e where employee_code='K001'), 4.50, 1.00),
  ((select service_period_id from sp_lunch), (select employee_id from e where employee_code='KM01'), 3.50, 1.25),
  ((select service_period_id from sp_dinner), (select employee_id from e where employee_code='K001'), 5.00, 1.00),
  ((select service_period_id from sp_dinner), (select employee_id from e where employee_code='KM01'), 4.00, 1.50)
on conflict (service_period_id, employee_id) do nothing;

commit;