'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { calculateWeeklyKitchenPayouts } from '@/lib/lib/tipCalculator'

function asNumber(value, fieldName) {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number for ${fieldName}: ${String(value)}`)
  }
  return n
}

function toIsoDateUTC(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDaysToIsoDateUTC(isoDate, daysToAdd) {
  if (typeof isoDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error(`Invalid ISO date (YYYY-MM-DD): ${String(isoDate)}`)
  }
  const [y, m, d] = isoDate.split('-').map((x) => Number(x))
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + daysToAdd)
  return toIsoDateUTC(dt)
}

function formatPeriodLabel(p) {
  const date = p?.period_date ?? ''
  const type = p?.period_type ?? ''
  return `${date} (${type})`
}

export default function ManagerKitchenWeeklyPage() {
  const [weekStartDate, setWeekStartDate] = useState('')

  const [bohEmployees, setBohEmployees] = useState([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  const [isComputing, setIsComputing] = useState(false)
  const [isLoadingStored, setIsLoadingStored] = useState(false)

  const [loadError, setLoadError] = useState(null)
  const [computeError, setComputeError] = useState(null)
  const [writeError, setWriteError] = useState(null)
  const [storedError, setStoredError] = useState(null)

  const [computedResult, setComputedResult] = useState(null)
  // computedResult shape:
  // {
  //   weekId,
  //   totalKitchenPool,
  //   servicePeriods: [{ id, period_date, period_type }],
  //   payoutsByEmployeeId: { [employeeId]: { weeklyKitchenPayout, lineItems } }
  // }

  const [storedPreview, setStoredPreview] = useState([])

  const weekId = weekStartDate

  const weekWindow = useMemo(() => {
    if (!weekStartDate) return null
    const startDate = weekStartDate
    const endDateExclusive = addDaysToIsoDateUTC(weekStartDate, 7)
    return { startDate, endDateExclusive }
  }, [weekStartDate])

  const loadBohEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code, display_name, role, is_active')
        .in('role', ['kitchen', 'kitchen_manager'])
        .eq('is_active', true)
        .order('role', { ascending: true })
        .order('employee_code', { ascending: true })

      if (error) throw error
      setBohEmployees(Array.isArray(data) ? data : [])
    } catch (e) {
      setLoadError(e?.message || String(e))
      setBohEmployees([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [])

  const loadStoredPreviewForWeek = useCallback(async (weekIdToLoad) => {
    setIsLoadingStored(true)
    setStoredError(null)
    try {
      if (!weekIdToLoad) {
        setStoredPreview([])
        return []
      }

      /** @type {Array<any>} */
      let rows = []

      // Attempt relationship select first (works when FK is present).
      const relRes = await supabase
        .from('weekly_kitchen_payouts')
        .select('week_id, employee_id, weekly_kitchen_payout, employees ( employee_code, display_name, role )')
        .eq('week_id', weekIdToLoad)
        .order('employee_id', { ascending: true })

      if (!relRes.error) {
        rows = Array.isArray(relRes.data) ? relRes.data : []
      } else {
        // Fallback: payouts -> employees lookup
        const pRes = await supabase
          .from('weekly_kitchen_payouts')
          .select('week_id, employee_id, weekly_kitchen_payout')
          .eq('week_id', weekIdToLoad)
          .order('employee_id', { ascending: true })

        if (pRes.error) throw pRes.error
        rows = Array.isArray(pRes.data) ? pRes.data : []

        const employeeIds = Array.from(new Set(rows.map((r) => r.employee_id).filter(Boolean)))
        /** @type {Record<string, any>} */
        const employeeById = {}
        if (employeeIds.length > 0) {
          const eRes = await supabase
            .from('employees')
            .select('id, employee_code, display_name, role')
            .in('id', employeeIds)

          if (eRes.error) throw eRes.error
          for (const emp of eRes.data || []) employeeById[emp.id] = emp
        }

        rows = rows.map((r) => ({ ...r, employees: employeeById[r.employee_id] || null }))
      }

      setStoredPreview(rows)
      return rows
    } catch (e) {
      setStoredError(e?.message || String(e))
      setStoredPreview([])
      return []
    } finally {
      setIsLoadingStored(false)
    }
  }, [])

  useEffect(() => {
    loadBohEmployees()
  }, [loadBohEmployees])

  useEffect(() => {
    setComputedResult(null)
    setComputeError(null)
    setWriteError(null)
    setStoredError(null)
    setStoredPreview([])

    if (!weekId) return
    loadStoredPreviewForWeek(weekId)
  }, [weekId, loadStoredPreviewForWeek])

  const computeAndPersistWeeklyPayouts = useCallback(async () => {
    setComputeError(null)
    setWriteError(null)
    setComputedResult(null)

    if (!weekStartDate) {
      setComputeError('Select a week start date (Monday) first.')
      return
    }

    setIsComputing(true)
    try {
      const { startDate, endDateExclusive } = weekWindow || {}
      if (!startDate || !endDateExclusive) {
        throw new Error('Invalid week window. Please re-select the week start date.')
      }

      // 1) Fetch service periods within week window
      const spRes = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .gte('period_date', startDate)
        .lt('period_date', endDateExclusive)
        .order('period_date', { ascending: true })
        .order('period_type', { ascending: true })

      if (spRes.error) throw spRes.error
      const servicePeriods = Array.isArray(spRes.data) ? spRes.data : []

      if (servicePeriods.length === 0) {
        setComputeError(`No service periods found between ${startDate} and ${endDateExclusive} (exclusive).`)
        return
      }

      const servicePeriodIds = servicePeriods.map((p) => p.id)

      // 2) Fetch totals for those service periods
      const totalsRes = await supabase
        .from('service_period_totals')
        .select('service_period_id, kitchen_pool_total')
        .in('service_period_id', servicePeriodIds)

      if (totalsRes.error) throw totalsRes.error
      const totals = Array.isArray(totalsRes.data) ? totalsRes.data : []

      /** @type {Record<string, any>} */
      const totalsByPeriodId = {}
      for (const t of totals) {
        if (t?.service_period_id) totalsByPeriodId[t.service_period_id] = t
      }

      const missingTotals = servicePeriodIds.filter((id) => !totalsByPeriodId[id])
      if (missingTotals.length > 0) {
        const missingLabels = servicePeriods
          .filter((p) => missingTotals.includes(p.id))
          .map((p) => formatPeriodLabel(p))
          .join(', ')
        setComputeError(
          `Missing service_period_totals for ${missingTotals.length} service period(s): ${missingLabels}. Run /manager/compute for those periods first.`
        )
        return
      }

      // 3) Fetch kitchen work logs for those service periods (+ employee display)
      /** @type {Array<any>} */
      let logs = []
      /** @type {Record<string, { employee_code?: string, display_name?: string, role?: string }>} */
      let employeeById = {}

      const relLogsRes = await supabase
        .from('kitchen_work_logs')
        .select('service_period_id, employee_id, hours_worked, role_weight, employees ( employee_code, display_name, role )')
        .in('service_period_id', servicePeriodIds)
        .order('service_period_id', { ascending: true })
        .order('employee_id', { ascending: true })

      if (!relLogsRes.error) {
        logs = Array.isArray(relLogsRes.data) ? relLogsRes.data : []
        for (const l of logs) {
          const emp = l?.employees
          if (emp && l?.employee_id) {
            employeeById[l.employee_id] = {
              employee_code: emp.employee_code ?? '',
              display_name: emp.display_name ?? '',
              role: emp.role ?? ''
            }
          }
        }
      } else {
        const logsRes = await supabase
          .from('kitchen_work_logs')
          .select('service_period_id, employee_id, hours_worked, role_weight')
          .in('service_period_id', servicePeriodIds)
          .order('service_period_id', { ascending: true })
          .order('employee_id', { ascending: true })

        if (logsRes.error) throw logsRes.error
        logs = Array.isArray(logsRes.data) ? logsRes.data : []

        const employeeIds = Array.from(new Set(logs.map((l) => l.employee_id).filter(Boolean)))
        if (employeeIds.length > 0) {
          const empRes = await supabase
            .from('employees')
            .select('id, employee_code, display_name, role')
            .in('id', employeeIds)

          if (empRes.error) throw empRes.error
          for (const emp of empRes.data || []) {
            employeeById[emp.id] = {
              employee_code: emp.employee_code ?? '',
              display_name: emp.display_name ?? '',
              role: emp.role ?? ''
            }
          }
        }
      }

      // 4) Build engine inputs EXACTLY
      const periodKitchenPools = servicePeriodIds.map((servicePeriodId) => {
        const t = totalsByPeriodId[servicePeriodId]
        return {
          servicePeriodId,
          kitchenPoolTotal: asNumber(t.kitchen_pool_total, `kitchen_pool_total for service_period_id=${servicePeriodId}`)
        }
      })

      const kitchenWorkLogs = logs.map((l) => {
        const employeeId = l.employee_id
        const servicePeriodId = l.service_period_id
        return {
          employeeId,
          servicePeriodId,
          hoursWorked: asNumber(l.hours_worked, `hours_worked for employee_id=${employeeId}`),
          roleWeight: asNumber(l.role_weight, `role_weight for employee_id=${employeeId}`)
        }
      })

      // 5) Compute
      const engine = calculateWeeklyKitchenPayouts({
        weekId,
        periodKitchenPools,
        kitchenWorkLogs
      })

      if (engine?.hasError) {
        setComputeError(engine.errorMessage || 'Tip engine returned an error.')
        return
      }

      // 6) Persist (idempotent)
      const payouts = Array.isArray(engine.payoutsByKitchenEmployee) ? engine.payoutsByKitchenEmployee : []
      const upserts = payouts.map((p) => ({
        week_id: weekId,
        employee_id: p.employeeId,
        weekly_kitchen_payout: p.weeklyKitchenPayout
      }))

      if (upserts.length > 0) {
        const upsertRes = await supabase
          .from('weekly_kitchen_payouts')
          .upsert(upserts, { onConflict: 'week_id,employee_id' })
        if (upsertRes.error) throw upsertRes.error
      }

      // 7) Prepare computed UI + refresh stored preview
      const totalKitchenPool = periodKitchenPools.reduce((sum, p) => sum + p.kitchenPoolTotal, 0)

      /** @type {Record<string, { weeklyKitchenPayout:number, lineItems:string[] }>} */
      const payoutsByEmployeeId = {}
      for (const p of payouts) {
        payoutsByEmployeeId[p.employeeId] = {
          weeklyKitchenPayout: p.weeklyKitchenPayout,
          lineItems: Array.isArray(p.lineItems) ? p.lineItems : []
        }
      }

      setComputedResult({
        weekId,
        totalKitchenPool,
        servicePeriods,
        payoutsByEmployeeId,
        employeeById
      })

      await loadStoredPreviewForWeek(weekId)
    } catch (e) {
      setWriteError(e?.message || String(e))
    } finally {
      setIsComputing(false)
    }
  }, [weekStartDate, weekWindow, weekId, loadStoredPreviewForWeek])

  const isBusy = isLoadingEmployees || isComputing || isLoadingStored

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Manager · Weekly kitchen payouts</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          <span style={{ marginRight: 8 }}>Week start (Monday)</span>
          <input
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            disabled={isBusy}
          />
        </label>

        <button onClick={loadBohEmployees} disabled={isBusy}>
          {isLoadingEmployees ? 'Loading…' : 'Reload employees'}
        </button>

        <button onClick={computeAndPersistWeeklyPayouts} disabled={isBusy || !weekStartDate}>
          {isComputing ? 'Computing…' : 'Compute weekly kitchen payouts'}
        </button>
      </div>

      {weekWindow ? (
        <div style={{ marginBottom: 12, color: '#444' }}>
          Week window: <strong>{weekWindow.startDate}</strong> to <strong>{weekWindow.endDateExclusive}</strong> (exclusive)
        </div>
      ) : null}

      {loadError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
          <strong>Load error:</strong> {loadError}
        </div>
      ) : null}
      {computeError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
          <strong>Compute error:</strong> {computeError}
          <div style={{ marginTop: 6, color: '#555' }}>
            (No writes were performed because the engine returned an error or required inputs were missing.)
          </div>
        </div>
      ) : null}
      {writeError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
          <strong>Write error:</strong> {writeError}
        </div>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0, marginBottom: 10 }}>Computed results</h3>

        {!computedResult ? (
          <div style={{ color: '#666' }}>Select a week start date and compute to see results.</div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>weekId</div>
                <div style={{ fontWeight: 600 }}>{computedResult.weekId}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Total kitchen pool (week)</div>
                <div style={{ fontWeight: 600 }}>{Number(computedResult.totalKitchenPool).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Service periods</div>
                <div style={{ fontWeight: 600 }}>{computedResult.servicePeriods.length}</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>Service periods in week</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {computedResult.servicePeriods.map((p) => (
                  <li key={p.id}>
                    {formatPeriodLabel(p)} <span style={{ color: '#aaa' }}>({p.id})</span>
                  </li>
                ))}
              </ul>
            </div>

            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Employee</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Role</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Weekly payout</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Line items</th>
                </tr>
              </thead>
              <tbody>
                {bohEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 8, color: '#666' }}>
                      No active BOH employees found.
                    </td>
                  </tr>
                ) : (
                  bohEmployees.map((emp) => {
                    const payout = computedResult.payoutsByEmployeeId?.[emp.id] || {
                      weeklyKitchenPayout: 0,
                      lineItems: []
                    }
                    return (
                      <tr key={emp.id}>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                          <div style={{ fontWeight: 600 }}>{emp.employee_code}</div>
                          {emp.display_name ? <div style={{ color: '#666', fontSize: 12 }}>{emp.display_name}</div> : null}
                          <div style={{ color: '#aaa', fontSize: 11 }}>{emp.id}</div>
                        </td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{emp.role}</td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                          {Number(payout.weeklyKitchenPayout).toFixed(2)}
                        </td>
                        <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                          {payout.lineItems.length === 0 ? (
                            <div style={{ color: '#666' }}>—</div>
                          ) : (
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {payout.lineItems.map((li, idx) => (
                                <li key={idx} style={{ marginBottom: 4 }}>
                                  {li}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 10 }}>Stored preview</h3>

        {storedError ? (
          <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
            <strong>Stored preview error:</strong> {storedError}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <button onClick={() => loadStoredPreviewForWeek(weekId)} disabled={isLoadingStored || !weekId}>
            {isLoadingStored ? 'Loading…' : 'Reload stored preview'}
          </button>
          {weekId ? <div style={{ color: '#666' }}>weekId: {weekId}</div> : <div style={{ color: '#666' }}>No week selected.</div>}
        </div>

        {!weekId ? (
          <div style={{ color: '#666' }}>Select a week start date to view stored payouts.</div>
        ) : isLoadingStored ? (
          <div style={{ color: '#666' }}>Loading…</div>
        ) : storedPreview.length === 0 ? (
          <div style={{ color: '#666' }}>No weekly kitchen payouts stored for this week.</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Employee</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Role</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Stored payout</th>
              </tr>
            </thead>
            <tbody>
              {storedPreview.map((r) => {
                const emp = r?.employees || {}
                const label = emp.employee_code || r.employee_id || '(unknown)'
                return (
                  <tr key={`${r.week_id}-${r.employee_id}`}>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                      <div style={{ fontWeight: 600 }}>{label}</div>
                      {emp.display_name ? <div style={{ color: '#666', fontSize: 12 }}>{emp.display_name}</div> : null}
                      <div style={{ color: '#aaa', fontSize: 11 }}>{r.employee_id}</div>
                    </td>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{emp.role || '(unknown)'}</td>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                      {Number(r.weekly_kitchen_payout).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

