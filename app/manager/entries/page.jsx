'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/app/components/AppHeader'
import { requireManager } from '@/app/lib/requireRole'

function asNumber(value, fieldName) {
  const n = Number(value)
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${fieldName}: ${String(value)}`)
  return n
}

function formatMoney(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function roleSortKey(role) {
  // Bartenders first, then servers.
  return role === 'bartender' ? '0' : role === 'server' ? '1' : `9-${String(role || '')}`
}

export default function ManagerEntriesPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  const [periodDate, setPeriodDate] = useState('')
  const [periodType, setPeriodType] = useState('lunch')
  const [activePeriod, setActivePeriod] = useState(null) // { id, period_date, period_type }

  const [fohEmployees, setFohEmployees] = useState([])

  // Totals inputs for the selected service period.
  const [totalsInputs, setTotalsInputs] = useState({ bartender_pool_total: '', kitchen_pool_total: '' })
  const [totalsStatus, setTotalsStatus] = useState('unknown') // 'unknown' | 'set' | 'missing'
  const [isLoadingTotals, setIsLoadingTotals] = useState(false)
  const [isSavingTotals, setIsSavingTotals] = useState(false)
  const [totalsError, setTotalsError] = useState(null)
  const [totalsSuccess, setTotalsSuccess] = useState(null)

  // inputsByEmployeeId:
  // { [employeeId]: { sales_total: string, tips_collected: string, bartender_slot: string } }
  const [inputsByEmployeeId, setInputsByEmployeeId] = useState({})

  const [storedEntries, setStoredEntries] = useState([])

  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsAllowed(requireManager(router))
  }, [mounted, router])

  const isBusy =
    isLoadingEmployees || isLoadingPeriod || isLoadingEntries || isSaving || isLoadingTotals || isSavingTotals

  const setTotalsInput = useCallback((patch) => {
    setTotalsInputs((prev) => ({ ...prev, ...patch }))
  }, [])

  const setEmployeeInput = useCallback((employeeId, patch) => {
    setInputsByEmployeeId((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] || { sales_total: '', tips_collected: '', bartender_slot: '' }), ...patch }
    }))
  }, [])

  const clearRow = useCallback((employeeId) => {
    setInputsByEmployeeId((prev) => ({
      ...prev,
      [employeeId]: { sales_total: '', tips_collected: '', bartender_slot: '' }
    }))
  }, [])

  const loadFohEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code, display_name, role, is_active')
        .in('role', ['bartender', 'server'])
        .eq('is_active', true)
        .order('role', { ascending: true })
        .order('employee_code', { ascending: true })

      if (error) throw error
      const employees = Array.isArray(data) ? data : []

      // Deterministic client sort (bartender first then server, then employee_code).
      employees.sort((a, b) => {
        const ra = roleSortKey(a.role)
        const rb = roleSortKey(b.role)
        if (ra !== rb) return ra.localeCompare(rb)
        const ca = String(a.employee_code || '')
        const cb = String(b.employee_code || '')
        if (ca !== cb) return ca.localeCompare(cb)
        return String(a.id || '').localeCompare(String(b.id || ''))
      })

      setFohEmployees(employees)
    } catch (e) {
      setLoadError(e?.message || String(e))
      setFohEmployees([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [])

  const loadTotalsForPeriod = useCallback(async (servicePeriodId) => {
    setIsLoadingTotals(true)
    setTotalsError(null)
    setTotalsSuccess(null)
    try {
      const res = await supabase
        .from('service_period_totals')
        .select('service_period_id, bartender_pool_total, kitchen_pool_total')
        .eq('service_period_id', servicePeriodId)
        .maybeSingle()

      if (res.error) throw res.error

      if (!res.data) {
        setTotalsStatus('missing')
        setTotalsInputs({ bartender_pool_total: '', kitchen_pool_total: '' })
        return
      }

      setTotalsStatus('set')
      setTotalsInputs({
        bartender_pool_total: res.data.bartender_pool_total != null ? String(res.data.bartender_pool_total) : '0',
        kitchen_pool_total: res.data.kitchen_pool_total != null ? String(res.data.kitchen_pool_total) : '0'
      })
    } catch (e) {
      setTotalsError(e?.message || String(e))
      setTotalsStatus('unknown')
    } finally {
      setIsLoadingTotals(false)
    }
  }, [])

  const loadEntriesForPeriod = useCallback(
    async (servicePeriodId) => {
      setIsLoadingEntries(true)
      setLoadError(null)
      setSaveError(null)
      setSaveSuccess(null)
      try {
        /** @type {Array<any>} */
        let entries = []

        // Attempt relationship select first.
        const relRes = await supabase
          .from('service_period_entries')
          .select(
            'id, service_period_id, employee_id, role, sales_total, tips_collected, bartender_slot, created_at, employees ( employee_code, display_name, role )'
          )
          .eq('service_period_id', servicePeriodId)
          .order('employee_id', { ascending: true })

        if (!relRes.error) {
          entries = Array.isArray(relRes.data) ? relRes.data : []
        } else {
          // Fallback: entries -> employees lookup
          const eRes = await supabase
            .from('service_period_entries')
            .select('id, service_period_id, employee_id, role, sales_total, tips_collected, bartender_slot, created_at')
            .eq('service_period_id', servicePeriodId)
            .order('employee_id', { ascending: true })

          if (eRes.error) throw eRes.error
          entries = Array.isArray(eRes.data) ? eRes.data : []

          const employeeIds = Array.from(new Set(entries.map((x) => x.employee_id).filter(Boolean))).sort()
          /** @type {Record<string, any>} */
          const employeeById = {}
          if (employeeIds.length > 0) {
            const empRes = await supabase
              .from('employees')
              .select('id, employee_code, display_name, role')
              .in('id', employeeIds)

            if (empRes.error) throw empRes.error
            for (const emp of empRes.data || []) employeeById[emp.id] = emp
          }

          entries = entries.map((x) => ({ ...x, employees: employeeById[x.employee_id] || null }))
        }

        // Store preview entries with deterministic ordering: bartenders first, then servers, then employee_code.
        entries = entries.slice().sort((a, b) => {
          const ra = roleSortKey(a.role)
          const rb = roleSortKey(b.role)
          if (ra !== rb) return ra.localeCompare(rb)
          const ea = a?.employees?.employee_code || ''
          const eb = b?.employees?.employee_code || ''
          if (ea !== eb) return String(ea).localeCompare(String(eb))
          return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
        })

        setStoredEntries(entries)

        // Prefill inputs for currently loaded employees.
        /** @type {Record<string, any>} */
        const entryByEmployeeId = {}
        for (const e of entries) {
          if (e?.employee_id) entryByEmployeeId[e.employee_id] = e
        }

        setInputsByEmployeeId((prev) => {
          /** @type {Record<string, { sales_total:string, tips_collected:string, bartender_slot:string }>} */
          const next = {}

          for (const emp of fohEmployees || []) {
            const existing = entryByEmployeeId[emp.id]
            // If user has typed but we reloaded, prefer DB values (deterministic prefill).
            next[emp.id] = {
              sales_total: existing?.sales_total != null ? String(existing.sales_total) : '',
              tips_collected: existing?.tips_collected != null ? String(existing.tips_collected) : '',
              bartender_slot: existing?.bartender_slot != null ? String(existing.bartender_slot) : ''
            }
          }

          // Preserve any rows for employees not currently in list (rare), to avoid dropping local edits.
          for (const [k, v] of Object.entries(prev || {})) {
            if (!next[k]) next[k] = v
          }

          return next
        })
      } catch (e) {
        setLoadError(e?.message || String(e))
        setStoredEntries([])
      } finally {
        setIsLoadingEntries(false)
      }
    },
    [fohEmployees]
  )

  useEffect(() => {
    if (!mounted || !isAllowed) return
    loadFohEmployees()
  }, [mounted, isAllowed, loadFohEmployees])

  useEffect(() => {
    if (!mounted || !isAllowed) return
    if (!activePeriod?.id) return
    if (fohEmployees.length === 0) return
    loadEntriesForPeriod(activePeriod.id)
  }, [mounted, isAllowed, activePeriod?.id, fohEmployees, loadEntriesForPeriod])

  useEffect(() => {
    if (!mounted || !isAllowed) return
    if (!activePeriod?.id) {
      setTotalsStatus('unknown')
      setTotalsInputs({ bartender_pool_total: '', kitchen_pool_total: '' })
      return
    }
    loadTotalsForPeriod(activePeriod.id)
  }, [mounted, isAllowed, activePeriod?.id, loadTotalsForPeriod])

  const loadOrCreatePeriod = useCallback(async () => {
    setLoadError(null)
    setSaveError(null)
    setSaveSuccess(null)
    setTotalsError(null)
    setTotalsSuccess(null)
    setActivePeriod(null)
    setStoredEntries([])
    setTotalsStatus('unknown')

    const d = periodDate
    const t = periodType
    if (!d) {
      setLoadError('Select a date first.')
      return
    }
    if (t !== 'lunch' && t !== 'dinner') {
      setLoadError('Select a period type (lunch or dinner).')
      return
    }

    setIsLoadingPeriod(true)
    try {
      // Try to find existing
      const findRes = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .eq('period_date', d)
        .eq('period_type', t)
        .maybeSingle()

      if (findRes.error) throw findRes.error

      if (findRes.data?.id) {
        setActivePeriod(findRes.data)
        return
      }

      // Create if missing
      const createRes = await supabase
        .from('service_periods')
        .insert({ period_date: d, period_type: t })
        .select('id, period_date, period_type')
        .single()

      if (createRes.error) throw createRes.error
      setActivePeriod(createRes.data)
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoadingPeriod(false)
    }
  }, [periodDate, periodType])

  const saveTotals = useCallback(async () => {
    setTotalsError(null)
    setTotalsSuccess(null)

    const servicePeriodId = activePeriod?.id
    if (!servicePeriodId) {
      setTotalsError('Load or create a service period first.')
      return
    }

    const bartenderRaw = String(totalsInputs.bartender_pool_total ?? '').trim()
    const kitchenRaw = String(totalsInputs.kitchen_pool_total ?? '').trim()
    if (bartenderRaw === '' || kitchenRaw === '') {
      setTotalsError('Enter both bartender_pool_total and kitchen_pool_total.')
      return
    }

    setIsSavingTotals(true)
    try {
      const bartenderPoolTotal = asNumber(bartenderRaw, 'bartender_pool_total')
      const kitchenPoolTotal = asNumber(kitchenRaw, 'kitchen_pool_total')
      if (bartenderPoolTotal < 0) throw new Error('bartender_pool_total must be >= 0.')
      if (kitchenPoolTotal < 0) throw new Error('kitchen_pool_total must be >= 0.')

      const upsertRes = await supabase
        .from('service_period_totals')
        .upsert(
          {
            service_period_id: servicePeriodId,
            bartender_pool_total: bartenderPoolTotal,
            kitchen_pool_total: kitchenPoolTotal
          },
          { onConflict: 'service_period_id' }
        )

      if (upsertRes.error) throw upsertRes.error
      setTotalsStatus('set')
      setTotalsSuccess('Saved totals.')
    } catch (e) {
      setTotalsError(e?.message || String(e))
    } finally {
      setIsSavingTotals(false)
    }
  }, [activePeriod?.id, totalsInputs])

  const saveEntries = useCallback(async () => {
    setSaveError(null)
    setSaveSuccess(null)

    const servicePeriodId = activePeriod?.id
    if (!servicePeriodId) {
      setSaveError('Load or create a service period first.')
      return
    }

    setIsSaving(true)
    try {
      const upserts = []

      for (const emp of fohEmployees || []) {
        const row = inputsByEmployeeId?.[emp.id] || { sales_total: '', tips_collected: '', bartender_slot: '' }
        const salesRaw = String(row.sales_total ?? '').trim()
        const tipsRaw = String(row.tips_collected ?? '').trim()
        const slotRaw = String(row.bartender_slot ?? '').trim()

        const hasAny = salesRaw !== '' || tipsRaw !== '' || slotRaw !== ''
        if (!hasAny) continue

        if (salesRaw === '' || tipsRaw === '') {
          throw new Error(`Enter both sales_total and tips_collected for ${emp.employee_code}.`)
        }

        const sales = asNumber(salesRaw, `sales_total for employee_id=${emp.id}`)
        const tips = asNumber(tipsRaw, `tips_collected for employee_id=${emp.id}`)

        if (sales < 0) throw new Error(`sales_total must be >= 0 for ${emp.employee_code}.`)
        if (tips < 0) throw new Error(`tips_collected must be >= 0 for ${emp.employee_code}.`)

        let bartenderSlot = null
        if (emp.role === 'bartender') {
          if (slotRaw === '') {
            throw new Error(`Bartender slot is required for bartender ${emp.employee_code} (use 1 or 2).`)
          }
          const parsed = Number(slotRaw)
          if (!Number.isInteger(parsed) || (parsed !== 1 && parsed !== 2)) {
            throw new Error(`bartender_slot must be 1 or 2 for bartender ${emp.employee_code}.`)
          }
          bartenderSlot = parsed
        } else {
          // Server: ignore any typed slot.
          bartenderSlot = null
        }

        upserts.push({
          service_period_id: servicePeriodId,
          employee_id: emp.id,
          role: emp.role,
          sales_total: sales,
          tips_collected: tips,
          bartender_slot: bartenderSlot
        })
      }

      if (upserts.length === 0) {
        setSaveError('Enter at least one row before saving.')
        return
      }

      const upsertRes = await supabase
        .from('service_period_entries')
        .upsert(upserts, { onConflict: 'service_period_id,employee_id' })

      if (upsertRes.error) {
        const msg = upsertRes.error.message || String(upsertRes.error)
        if (msg.toLowerCase().includes('no unique or exclusion constraint')) {
          throw new Error(
            "Upsert failed because the DB is missing a UNIQUE constraint on (service_period_id, employee_id). Add that constraint (or matching unique index) and retry."
          )
        }
        throw upsertRes.error
      }

      setSaveSuccess('Saved entries.')
      await loadEntriesForPeriod(servicePeriodId)
    } catch (e) {
      setSaveError(e?.message || String(e))
    } finally {
      setIsSaving(false)
    }
  }, [activePeriod?.id, fohEmployees, inputsByEmployeeId, loadEntriesForPeriod])

  const previewRows = useMemo(() => {
    const entries = Array.isArray(storedEntries) ? storedEntries : []
    return entries.map((e) => {
      const emp = e?.employees || {}
      return {
        id: e.id || `${e.service_period_id}-${e.employee_id}`,
        employee_code: emp.employee_code || '(unknown)',
        display_name: emp.display_name || '',
        role: e.role || emp.role || '',
        sales_total: e.sales_total,
        tips_collected: e.tips_collected,
        bartender_slot: e.bartender_slot
      }
    })
  }, [storedEntries])

  if (!mounted || !isAllowed) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppHeader title="Manager" subtitle="Service period entries" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600">Checking access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Manager" subtitle="Service period entries" />

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Select or create service period</div>
              <div className="mt-1 text-xs text-zinc-500">
                Choose date + lunch/dinner, then load existing or create a new period.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Date</div>
                <input
                  type="date"
                  value={periodDate}
                  onChange={(e) => setPeriodDate(e.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </label>

              <label className="text-xs text-zinc-600">
                <div className="mb-1">Period type</div>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="lunch">lunch</option>
                  <option value="dinner">dinner</option>
                </select>
              </label>

              <button
                onClick={loadOrCreatePeriod}
                disabled={isBusy || !periodDate}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingPeriod ? 'Loading…' : 'Load / Create'}
              </button>
            </div>
          </div>

          {activePeriod ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-zinc-500">
                Selected service_period_id: <span className="font-mono">{activePeriod.id}</span>
              </div>
              <div className="text-xs">
                {totalsStatus === 'set' ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    Totals: set
                  </span>
                ) : totalsStatus === 'missing' ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                    Totals: missing
                  </span>
                ) : (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-zinc-600">
                    Totals: —
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-zinc-500">No service period selected.</div>
          )}

          {loadError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}
        </div>

        {activePeriod?.id ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Totals</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Set bartender + kitchen pool totals for this service period.
                </div>
              </div>
              <button
                onClick={saveTotals}
                disabled={isBusy}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingTotals ? 'Saving…' : 'Save totals'}
              </button>
            </div>

            {isLoadingTotals ? (
              <div className="mt-4 text-sm text-zinc-600">Loading totals…</div>
            ) : null}

            {totalsError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {totalsError}
              </div>
            ) : null}
            {totalsSuccess ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {totalsSuccess}
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-600">
                <div className="mb-1">bartender_pool_total</div>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={totalsInputs.bartender_pool_total}
                  onChange={(e) => setTotalsInput({ bartender_pool_total: e.target.value })}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-right focus:border-zinc-900 focus:outline-none"
                  placeholder="0.00"
                />
              </label>

              <label className="text-xs text-zinc-600">
                <div className="mb-1">kitchen_pool_total</div>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={totalsInputs.kitchen_pool_total}
                  onChange={(e) => setTotalsInput({ kitchen_pool_total: e.target.value })}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-right focus:border-zinc-900 focus:outline-none"
                  placeholder="0.00"
                />
              </label>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">FOH entries</div>
              <div className="mt-1 text-xs text-zinc-500">
                For this restaurant, <span className="font-medium">bartender_slot</span> should be 1 or 2 for bartenders.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadFohEmployees}
                disabled={isBusy}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingEmployees ? 'Loading…' : 'Reload employees'}
              </button>
              <button
                onClick={saveEntries}
                disabled={isBusy || !activePeriod?.id}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save entries'}
              </button>
            </div>
          </div>

          {saveError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}
          {saveSuccess ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {saveSuccess}
            </div>
          ) : null}

          {saveSuccess && activePeriod?.id ? (
            <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              <div className="font-medium">Next:</div>
              <div className="mt-1">
                Save totals (if not done) then Compute payouts.
              </div>
              <button
                onClick={() => router.push('/manager/compute')}
                className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50"
              >
                Go to Compute payouts
              </button>
            </div>
          ) : null}

          {!activePeriod?.id ? (
            <div className="mt-4 text-sm text-zinc-600">Load or create a service period to start entering rows.</div>
          ) : isLoadingEntries ? (
            <div className="mt-4 text-sm text-zinc-600">Loading existing entries…</div>
          ) : fohEmployees.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-600">No active FOH employees found.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4 text-right">Sales total ($)</th>
                    <th className="py-2 pr-4 text-right">Tips collected ($)</th>
                    <th className="py-2 pr-4 text-right">Bartender slot</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {fohEmployees.map((emp) => {
                    const row = inputsByEmployeeId?.[emp.id] || { sales_total: '', tips_collected: '', bartender_slot: '' }
                    const isBartender = emp.role === 'bartender'
                    return (
                      <tr key={emp.id}>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-zinc-900">{emp.employee_code}</div>
                          <div className="text-xs text-zinc-500">{emp.display_name || '—'}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            value={row.sales_total}
                            onChange={(e) => setEmployeeInput(emp.id, { sales_total: e.target.value })}
                            disabled={isBusy}
                            className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            value={row.tips_collected}
                            onChange={(e) => setEmployeeInput(emp.id, { tips_collected: e.target.value })}
                            disabled={isBusy}
                            className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {isBartender ? (
                            <input
                              type="number"
                              step="1"
                              inputMode="numeric"
                              value={row.bartender_slot}
                              onChange={(e) => setEmployeeInput(emp.id, { bartender_slot: e.target.value })}
                              disabled={isBusy}
                              className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                              placeholder="1 or 2"
                            />
                          ) : (
                            <div className="text-xs text-zinc-400">—</div>
                          )}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <button
                            onClick={() => clearRow(emp.id)}
                            disabled={isBusy}
                            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Clear
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activePeriod?.id ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Stored preview</div>
                <div className="mt-1 text-xs text-zinc-500">What is currently stored for this service period.</div>
              </div>
              <button
                onClick={() => loadEntriesForPeriod(activePeriod.id)}
                disabled={isBusy}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingEntries ? 'Loading…' : 'Reload preview'}
              </button>
            </div>

            {isLoadingEntries ? (
              <div className="mt-4 text-sm text-zinc-600">Loading…</div>
            ) : previewRows.length === 0 ? (
              <div className="mt-4 text-sm text-zinc-600">No entries stored yet for this service period.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                      <th className="py-2 pr-4">Employee</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4 text-right">Sales total</th>
                      <th className="py-2 pr-4 text-right">Tips collected</th>
                      <th className="py-2 pr-2 text-right">Bartender slot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {previewRows.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2 pr-4">
                          <div className="font-medium text-zinc-900">{r.employee_code}</div>
                          <div className="text-xs text-zinc-500">{r.display_name || '—'}</div>
                        </td>
                        <td className="py-2 pr-4">
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                            {r.role}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-right text-zinc-900">{formatMoney(r.sales_total)}</td>
                        <td className="py-2 pr-4 text-right text-zinc-900">{formatMoney(r.tips_collected)}</td>
                        <td className="py-2 pr-2 text-right text-zinc-900">
                          {r.bartender_slot != null ? String(r.bartender_slot) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}

