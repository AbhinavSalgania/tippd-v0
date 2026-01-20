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
  ('B005', 'Bartender 5', '1616', true, 'bartender'),
  ('M001', 'Manager 1', '0000', true, 'manager'),
  ('K001', 'Kitchen Manager 1', '0001', true, 'kitchen_manager');

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

truncate table
  public.service_period_entries,
  public.service_period_totals,
  public.service_period_payouts,
  public.payout_line_items
restart identity;

with
  foh_assignments as (
    select
      sa.service_period_id,
      sa.employee_id,
      sa.worked_role,
      sa.station,
      e.employee_code
    from public.shift_assignments sa
    join public.service_periods sp on sp.id = sa.service_period_id
    join public.employees e on e.id = sa.employee_id
    where sa.worked_role in ('server', 'bartender')
  ),
  bartender_counts as (
    select service_period_id, count(*) as bartender_count
    from public.shift_assignments
    where worked_role = 'bartender'
    group by service_period_id
  ),
  bartender_slots as (
    select
      service_period_id,
      employee_id,
      row_number() over (partition by service_period_id order by employee_id) as bartender_slot_rank
    from public.shift_assignments
    where worked_role = 'bartender'
  ),
  seeded as (
    select
      foh_assignments.*,
      ('x' || substr(md5(foh_assignments.employee_id::text || foh_assignments.service_period_id::text), 1, 8))::bit(32)::int as seed_sales,
      ('x' || substr(md5(foh_assignments.employee_id::text || foh_assignments.service_period_id::text), 9, 8))::bit(32)::int as seed_tip
    from foh_assignments
  ),
  randomized as (
    select
      seeded.*,
      ((seed_sales::bigint + 2147483648)::numeric / 4294967295) as sales_rand,
      ((seed_tip::bigint + 2147483648)::numeric / 4294967295) as tip_rand
    from seeded
  ),
  sales_ranges as (
    select
      randomized.*,
      case
        when worked_role = 'bartender' then 600
        when worked_role = 'server' and station ilike '%Dining%' then 400
        when worked_role = 'server' and station ilike '%Patio%' then 300
        else 400
      end as sales_min,
      case
        when worked_role = 'bartender' then 1000
        when worked_role = 'server' and station ilike '%Dining%' then 1200
        when worked_role = 'server' and station ilike '%Patio%' then 900
        else 1000
      end as sales_max
    from randomized
  ),
  sales_calc as (
    select
      sales_ranges.*,
      (sales_min + (sales_max - sales_min) * sales_rand) as sales_dollars
    from sales_ranges
  ),
  tip_base as (
    select
      sales_calc.*,
      case
        when worked_role = 'bartender' then 0.20
        when employee_code in ('S001', 'S003', 'S007') then 0.21
        when employee_code in ('S002', 'S005', 'S008') then 0.20
        when employee_code in ('S004', 'S006', 'S009', 'S010') then 0.19
        when employee_code in ('S011') then 0.185
        else 0.19
      end as base_tip_pct
    from sales_calc
  ),
  tip_calc as (
    select
      tip_base.*,
      case
        when sales_dollars < 600 then 0.010
        when sales_dollars <= 900 then 0.003
        else -0.005
      end as sales_tip_adj,
      (tip_rand * 0.03 - 0.015) as noise_tip_adj
    from tip_base
  ),
  final_entries as (
    select
      tip_calc.service_period_id,
      tip_calc.employee_id,
      tip_calc.worked_role as role,
      round(tip_calc.sales_dollars, 2)::numeric as sales_total,
      greatest(
        0.17,
        least(0.23, tip_calc.base_tip_pct + tip_calc.sales_tip_adj + tip_calc.noise_tip_adj)
      ) as tip_pct
    from tip_calc
  )
insert into public.service_period_entries (
  service_period_id,
  employee_id,
  role,
  sales_total,
  tips_collected,
  bartender_slot
)
select
  final_entries.service_period_id,
  final_entries.employee_id,
  final_entries.role,
  final_entries.sales_total,
  round(final_entries.sales_total * final_entries.tip_pct, 2)::numeric as tips_collected,
  case
    when final_entries.role = 'bartender'
      then case
        when coalesce(bartender_counts.bartender_count, 0) >= 2
          then bartender_slots.bartender_slot_rank
        else 1
      end
    else null
  end as bartender_slot
from final_entries
left join bartender_counts using (service_period_id)
left join bartender_slots
  on bartender_slots.service_period_id = final_entries.service_period_id
  and bartender_slots.employee_id = final_entries.employee_id;

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
select role, count(*) as role_count
from public.employees
group by role
order by role;
