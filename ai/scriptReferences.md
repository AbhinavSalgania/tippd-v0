# Tippd Script & Component Reference

A comprehensive reference of all scripts, components, routes, and utilities in the Tippd tip management system.

---

## App Routes & Pages

### `/` - Login Page
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/page.jsx`
Employee login page with PIN-based authentication. Public route with no role requirements.

### `/dashboard` - Employee Dashboard
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/dashboard/page.jsx`
Personal dashboard showing tip summaries, recent shifts, and earnings for all employee roles.

### `/manager/entries` - Sales & Tips Entry
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/entries/page.jsx`
Manager tool to enter sales and tips collected for each employee in a service period.

### `/manager/summary` - Payout Summaries
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/summary/page.jsx`
View and export payout summaries to TSV format. Manager-only route.

### `/manager/compute` - Compute Payouts
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/compute/page.jsx`
Compute and publish payouts for a selected service period. Manager-only route.

### `/manager/kitchen-hours` - Kitchen Hours Logging
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/kitchen-hours/page.jsx`
Log hours worked by kitchen staff for tip distribution. Requires kitchen_manager or manager role.

### `/manager/kitchen-weekly` - Weekly Kitchen Payouts
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/kitchen-weekly/page.jsx`
Calculate and view weekly kitchen tip payouts based on hours worked. Requires kitchen_manager or manager role.

### `/manager/assignments/[servicePeriodId]` - Shift Assignments
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/assignments/[servicePeriodId]/page.jsx`
Manage shift assignments for servers and bartenders in a specific service period.

---

## React Components

### AppHeader
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/components/AppHeader.jsx`
Navigation header with role-based links and logout functionality.

### ManagerEntriesClient
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/entries/ManagerEntriesClient.jsx`
Client component for entering sales and tips for service period entries with form validation.

### ManagerComputeClient
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/manager/compute/ManagerComputeClient.jsx`
Client component for computing payouts from entries with detailed breakdown display.

---

## Core Business Logic

### tipCalculator.js
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/lib/tipCalculator.js`
Core tip distribution engine with deterministic calculations using integer cents math.

**Key Functions:**
- `calculateWorkerObligations` - Calculate tip-outs for individual workers
- `calculateServicePeriodPayouts` - Compute payouts for all workers in a service period
- `calculateWeeklyKitchenPayouts` - Allocate kitchen pool across kitchen staff by hours worked

### tipCalculator.test.mjs
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/lib/tipCalculator.test.mjs`
Unit tests for the tip calculation engine.

---

## Utilities & Services

### supabaseClient.js
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/lib/supabaseClient.js`
Initialized Supabase client for database operations.

### requireRole.js
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/lib/requireRole.js`
Client-side role-based access control utilities for protecting routes.

**Key Functions:**
- `readSession()` - Read user session from sessionStorage
- `requireManager(router)` - Verify manager role access
- `requireKitchenManager(router)` - Verify kitchen_manager or manager role access

---

## Database Schema & Migrations

### Initial Schema (v2)
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/migrations/20260115194416_tippd_schema_v2.sql`
Core database schema with employees, service_periods, entries, payouts, and kitchen tracking tables.

### Add Employees Role
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/migrations/20260115195500_add_employees_role.sql`
Adds role column to employees table.

### Add Manager Role (Jan 19)
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/migrations/20260119000000_add_manager_role.sql`
Extends role support to include manager role type.

### Add Manager Role (Jan 20)
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/migrations/20260120000000_add_manager_role.sql`
Additional manager role migration.

### Add Allowed Roles & Shift Assignments
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/migrations/20260122000000_add_allowed_roles_and_shift_assignments.sql`
Adds employee_allowed_roles and shift_assignments tables for flexible role management.

### Seed Data
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/seed.sql`
Test data for development and testing.

---

## Scripts

### publishAllServicePeriods.mjs
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/scripts/publishAllServicePeriods.mjs`
Dev-only script for bulk computing and storing payouts for all service periods with safety flags.

---

## Configuration Files

### package.json
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/package.json`
Node.js dependencies and npm scripts configuration.

### next.config.ts
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/next.config.ts`
Next.js framework configuration.

### tsconfig.json
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/tsconfig.json`
TypeScript compiler configuration with Next.js plugin.

### postcss.config.mjs
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/postcss.config.mjs`
PostCSS configuration for Tailwind CSS v4.

### eslint.config.mjs
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/eslint.config.mjs`
ESLint code quality configuration.

### supabase/config.toml
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/supabase/config.toml`
Supabase local development environment configuration.

### .env.local
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/.env.local`
Environment variables for Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).

### globals.css
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/globals.css`
Global CSS styles and Tailwind directives.

### layout.tsx
**File:** `/Users/abhinavsalgania/Desktop/Tech Sales/tippd-v0/app/layout.tsx`
Root layout wrapper for the Next.js application.

---

## Database Tables Reference

### employees
Core employee data with PIN authentication, roles, and active status.

### service_periods
Lunch and dinner service periods identified by date and type.

### service_period_entries
Sales and tips collected by each employee for a service period.

### service_period_payouts
Calculated payout amounts including kitchen contributions, bartender pool shares, and net tips.

### payout_line_items
Detailed breakdown line items for each payout showing calculation steps.

### service_period_totals
Aggregated bartender and kitchen pool totals per service period.

### kitchen_work_logs
Hours worked by kitchen staff with role-based weight multipliers.

### weekly_kitchen_payouts
Final weekly kitchen tip distributions by employee.

### shift_assignments
Assignment of employees to specific roles and stations for service periods.

### employee_allowed_roles
Many-to-many mapping of employees to their allowed working roles.

---

## Business Rules

**Tip Calculation Rules:**
- Kitchen tip-out: 5.00% of sales (500 basis points)
- Bartender tip-out: 1.00% for 1 bartender, 2.00% for 2 bartenders
- Sales threshold: $150 minimum to trigger tip-out obligations
- Precision: All math uses integer cents for deterministic results
- Rounding: Half-away-from-zero method for fair rounding

**Role Weights:**
- Kitchen staff: 1.0x
- Kitchen manager: 1.25x

---

## User Roles

1. **server** - Front of house staff, view personal tips
2. **bartender** - Front of house staff, view personal tips and bartender pool share
3. **kitchen** - Back of house staff, view weekly kitchen payouts
4. **kitchen_manager** - Back of house manager, manage kitchen hours and weekly payouts
5. **manager** - Full admin access to all management features
