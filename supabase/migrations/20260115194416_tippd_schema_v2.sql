-- Tippd v2 schema migration (aligns to lib/lib/tipCalculator.js)
-- - Preserves existing tables by renaming to *_old when safe
-- - Creates new v2 tables for service-period pooling + weekly kitchen allocation
-- - No triggers: all calculations happen in JS

begin;

-- Supabase typically has pgcrypto; this makes gen_random_uuid() available.
create extension if not exists pgcrypto;


-- ---------------------------------------------------------------------
-- v2 tables (inputs + outputs used by the JS engine)
-- ---------------------------------------------------------------------

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique, -- e.g. S001, B001, K001 (used by app as stable identifier)
  display_name text,
  pin text not null,                 -- MVP PIN login (no hashing per request)
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists employees_employee_code_idx on public.employees (employee_code);


create table if not exists public.service_periods (
  id uuid primary key default gen_random_uuid(),
  period_date date not null,
  period_type text not null,
  created_at timestamptz not null default now(),
  constraint service_periods_period_type_check check (period_type in ('lunch', 'dinner')),
  constraint service_periods_period_unique unique (period_date, period_type)
);

create index if not exists service_periods_period_date_idx on public.service_periods (period_date);


create table if not exists public.service_period_entries (
  id uuid primary key default gen_random_uuid(),
  service_period_id uuid not null references public.service_periods(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  role text not null,
  bartender_slot smallint null, -- optional helper to cap bartenders per period without triggers
  sales_total numeric(10,2) not null,
  tips_collected numeric(10,2) not null,
  created_at timestamptz not null default now(),

  constraint service_period_entries_role_check check (role in ('server', 'bartender')),
  constraint service_period_entries_sales_nonneg check (sales_total >= 0),
  constraint service_period_entries_tips_nonneg check (tips_collected >= 0),

  -- Each employee appears at most once per service period.
  constraint service_period_entries_unique_worker unique (service_period_id, employee_id),

  -- bartender_slot rule (keeps schema compatible with engine, and enforces max 2 bartenders/period):
  constraint service_period_entries_bartender_slot_check check (
    (role = 'bartender' and bartender_slot in (1, 2))
    or
    (role <> 'bartender' and bartender_slot is null)
  )
);

-- Enforce: at most 2 bartenders per period (slot 1 and/or 2).
create unique index if not exists service_period_entries_bartender_slot_unique
  on public.service_period_entries (service_period_id, bartender_slot)
  where role = 'bartender';

create index if not exists service_period_entries_service_period_id_idx on public.service_period_entries (service_period_id);
create index if not exists service_period_entries_employee_id_idx on public.service_period_entries (employee_id);
create index if not exists service_period_entries_role_idx on public.service_period_entries (role);


create table if not exists public.service_period_totals (
  service_period_id uuid primary key references public.service_periods(id) on delete cascade,
  bartender_pool_total numeric(10,2) not null default 0,
  kitchen_pool_total numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),

  constraint service_period_totals_bartender_pool_nonneg check (bartender_pool_total >= 0),
  constraint service_period_totals_kitchen_pool_nonneg check (kitchen_pool_total >= 0)
);

create index if not exists service_period_totals_service_period_id_idx on public.service_period_totals (service_period_id);


create table if not exists public.service_period_payouts (
  id uuid primary key default gen_random_uuid(),
  service_period_id uuid not null references public.service_periods(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  role text not null,

  kitchen_contribution numeric(10,2) not null default 0,
  bartender_contribution numeric(10,2) not null default 0,
  bartender_share_received numeric(10,2) not null default 0,

  net_tips numeric(10,2) not null,               -- can be negative
  amount_owed_to_house numeric(10,2) not null default 0, -- >= 0

  created_at timestamptz not null default now(),

  constraint service_period_payouts_role_check check (role in ('server', 'bartender')),
  constraint service_period_payouts_kitchen_contribution_nonneg check (kitchen_contribution >= 0),
  constraint service_period_payouts_bartender_contribution_nonneg check (bartender_contribution >= 0),
  constraint service_period_payouts_bartender_share_nonneg check (bartender_share_received >= 0),
  constraint service_period_payouts_amount_owed_nonneg check (amount_owed_to_house >= 0),

  constraint service_period_payouts_unique_worker unique (service_period_id, employee_id)
);

create index if not exists service_period_payouts_service_period_id_idx on public.service_period_payouts (service_period_id);
create index if not exists service_period_payouts_employee_id_idx on public.service_period_payouts (employee_id);


create table if not exists public.payout_line_items (
  id uuid primary key default gen_random_uuid(),
  service_period_payout_id uuid not null references public.service_period_payouts(id) on delete cascade,
  sort_order integer not null,
  description text not null,
  amount numeric(10,2) null, -- +/- allowed; null allowed for purely informational lines if desired
  created_at timestamptz not null default now(),

  constraint payout_line_items_sort_order_nonneg check (sort_order >= 0),
  constraint payout_line_items_unique_order unique (service_period_payout_id, sort_order)
);

create index if not exists payout_line_items_payout_id_idx on public.payout_line_items (service_period_payout_id);


create table if not exists public.kitchen_work_logs (
  id uuid primary key default gen_random_uuid(),
  service_period_id uuid not null references public.service_periods(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  hours_worked numeric(6,2) not null,
  role_weight numeric(6,3) not null default 1.0,
  created_at timestamptz not null default now(),

  constraint kitchen_work_logs_hours_nonneg check (hours_worked >= 0),
  constraint kitchen_work_logs_role_weight_pos check (role_weight > 0),
  constraint kitchen_work_logs_unique_worker unique (service_period_id, employee_id)
);

create index if not exists kitchen_work_logs_service_period_id_idx on public.kitchen_work_logs (service_period_id);
create index if not exists kitchen_work_logs_employee_id_idx on public.kitchen_work_logs (employee_id);


create table if not exists public.weekly_kitchen_payouts (
  week_id text not null, -- matches engine input: weekId is a string (e.g. '2026-W03' or '2026-01-12')
  employee_id uuid not null references public.employees(id) on delete restrict,
  weekly_kitchen_payout numeric(10,2) not null,
  created_at timestamptz not null default now(),

  constraint weekly_kitchen_payouts_amount_nonneg check (weekly_kitchen_payout >= 0),
  constraint weekly_kitchen_payouts_pk primary key (week_id, employee_id)
);

create index if not exists weekly_kitchen_payouts_week_id_idx on public.weekly_kitchen_payouts (week_id);
create index if not exists weekly_kitchen_payouts_employee_id_idx on public.weekly_kitchen_payouts (employee_id);

commit;