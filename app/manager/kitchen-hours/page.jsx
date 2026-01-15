'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function formatPeriodLabel(p) {
  const date = p?.period_date ?? ''
  const type = p?.period_type ?? ''
  return `${date} (${type})`
}

function asNumber(value, fieldName) {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number for ${fieldName}: ${String(value)}`)
  }
  return n
}

function defaultRoleWeightForEmployeeRole(role) {
  return role === 'kitchen_manager' ? 1.25 : 1.0
}

export default function ManagerKitchenHoursPage() {
  const [servicePeriods, setServicePeriods] = useState([])
  const [selectedServicePeriodId, setSelectedServicePeriodId] = useState('')
  const [bohEmployees, setBohEmployees] = useState([])

  // inputsByEmployeeId shape:
  // { [employeeId]: { hours_worked: string, role_weight: string } }
  const [inputsByEmployeeId, setInputsByEmployeeId] = useState({})

  const [storedLogs, setStoredLogs] = useState([])

  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [loadError, setLoadError] = useState(null)
  const [logsError, setLogsError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)

  const selectedPeriod = useMemo(() => {
    return servicePeriods.find((p) => p.id === selectedServicePeriodId) || null
  }, [servicePeriods, selectedServicePeriodId])

  const loadPeriods = useCallback(async () => {
    setIsLoadingPeriods(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .order('period_date', { ascending: false })
        .order('period_type', { ascending: true })

      if (error) throw error

      const periods = Array.isArray(data) ? data : []
      setServicePeriods(periods)
      setSelectedServicePeriodId((prev) => prev || periods[0]?.id || '')
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoadingPeriods(false)
    }
  }, [])

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
      const employees = Array.isArray(data) ? data : []
      setBohEmployees(employees)
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [])

  const loadStoredLogsForPeriod = useCallback(async (servicePeriodId) => {
    setIsLoadingLogs(true)
    setLogsError(null)
    try {
      /** @type {Array<any>} */
      let logs = []

      // Attempt relationship select first (works when FK is present).
      const relRes = await supabase
        .from('kitchen_work_logs')
        .select(
          'id, service_period_id, employee_id, hours_worked, role_weight, created_at, employees ( employee_code, display_name, role )'
        )
        .eq('service_period_id', servicePeriodId)
        .order('created_at', { ascending: true })

      if (!relRes.error) {
        logs = Array.isArray(relRes.data) ? relRes.data : []
      } else {
        // Fallback: logs -> employees lookup
        const logRes = await supabase
          .from('kitchen_work_logs')
          .select('id, service_period_id, employee_id, hours_worked, role_weight, created_at')
          .eq('service_period_id', servicePeriodId)
          .order('created_at', { ascending: true })

        if (logRes.error) throw logRes.error
        logs = Array.isArray(logRes.data) ? logRes.data : []

        const employeeIds = Array.from(new Set(logs.map((l) => l.employee_id).filter(Boolean)))
        /** @type {Record<string, any>} */
        const employeeById = {}
        if (employeeIds.length > 0) {
          const empRes = await supabase
            .from('employees')
            .select('id, employee_code, display_name, role')
            .in('id', employeeIds)

          if (empRes.error) throw empRes.error
          for (const emp of empRes.data || []) {
            employeeById[emp.id] = emp
          }
        }

        logs = logs.map((l) => ({ ...l, employees: employeeById[l.employee_id] || null }))
      }

      setStoredLogs(logs)
      return logs
    } catch (e) {
      setLogsError(e?.message || String(e))
      setStoredLogs([])
      return []
    } finally {
      setIsLoadingLogs(false)
    }
  }, [])

  useEffect(() => {
    loadPeriods()
    loadBohEmployees()
  }, [loadPeriods, loadBohEmployees])

  // When period changes, load logs and prefill inputs.
  useEffect(() => {
    setSaveSuccess(null)
    setSaveError(null)

    const servicePeriodId = selectedServicePeriodId
    if (!servicePeriodId) {
      setStoredLogs([])
      return
    }

    let isCancelled = false
    ;(async () => {
      const logs = await loadStoredLogsForPeriod(servicePeriodId)
      if (isCancelled) return

      /** @type {Record<string, { hours_worked: string, role_weight: string }>} */
      const nextInputs = {}

      const logByEmployeeId = {}
      for (const l of logs || []) {
        if (l?.employee_id) logByEmployeeId[l.employee_id] = l
      }

      for (const emp of bohEmployees || []) {
        const existing = logByEmployeeId[emp.id]
        const defaultWeight = defaultRoleWeightForEmployeeRole(emp.role)
        nextInputs[emp.id] = {
          hours_worked: existing?.hours_worked != null ? String(existing.hours_worked) : '',
          role_weight:
            existing?.role_weight != null ? String(existing.role_weight) : String(defaultWeight)
        }
      }

      setInputsByEmployeeId(nextInputs)
    })()

    return () => {
      isCancelled = true
    }
  }, [selectedServicePeriodId, bohEmployees, loadStoredLogsForPeriod])

  const setEmployeeInput = useCallback((employeeId, patch) => {
    setInputsByEmployeeId((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] || { hours_worked: '', role_weight: '' }), ...patch }
    }))
  }, [])

  const saveKitchenHours = useCallback(async () => {
    setSaveError(null)
    setSaveSuccess(null)

    const servicePeriodId = selectedServicePeriodId
    if (!servicePeriodId) {
      setSaveError('Select a service period first.')
      return
    }

    setIsSaving(true)
    try {
      const upserts = []

      for (const emp of bohEmployees || []) {
        const row = inputsByEmployeeId?.[emp.id] || {}
        const hoursRaw = row.hours_worked
        const weightRaw = row.role_weight

        // Keep it simple: only write rows that have an hours entry.
        if (hoursRaw == null || String(hoursRaw).trim() === '') continue

        const hours = asNumber(hoursRaw, `hours_worked for employee_id=${emp.id}`)
        const weight = asNumber(weightRaw, `role_weight for employee_id=${emp.id}`)

        if (hours < 0) {
          throw new Error(`hours_worked must be >= 0 for employee_id=${emp.id}`)
        }
        if (!(weight > 0)) {
          throw new Error(`role_weight must be > 0 for employee_id=${emp.id}`)
        }

        upserts.push({
          service_period_id: servicePeriodId,
          employee_id: emp.id,
          hours_worked: hours,
          role_weight: weight
        })
      }

      if (upserts.length === 0) {
        setSaveError('Enter hours for at least one BOH employee before saving.')
        return
      }

      const upsertRes = await supabase
        .from('kitchen_work_logs')
        .upsert(upserts, { onConflict: 'service_period_id,employee_id' })

      if (upsertRes.error) throw upsertRes.error

      setSaveSuccess('Saved kitchen hours.')
      await loadStoredLogsForPeriod(servicePeriodId)
    } catch (e) {
      setSaveError(e?.message || String(e))
    } finally {
      setIsSaving(false)
    }
  }, [selectedServicePeriodId, bohEmployees, inputsByEmployeeId, loadStoredLogsForPeriod])

  const isBusy = isLoadingPeriods || isLoadingEmployees || isLoadingLogs || isSaving

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h2 style={{ margin: 0, marginBottom: 12 }}>Manager · Kitchen hours</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          <span style={{ marginRight: 8 }}>Service period</span>
          <select
            value={selectedServicePeriodId}
            onChange={(e) => setSelectedServicePeriodId(e.target.value)}
            disabled={isBusy}
          >
            <option value="">-- Select a service period --</option>
            {servicePeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {formatPeriodLabel(p)}
              </option>
            ))}
          </select>
        </label>

        <button onClick={loadPeriods} disabled={isBusy}>
          {isLoadingPeriods ? 'Loading…' : 'Reload periods'}
        </button>
        <button onClick={loadBohEmployees} disabled={isBusy}>
          {isLoadingEmployees ? 'Loading…' : 'Reload employees'}
        </button>
      </div>

      {selectedPeriod ? (
        <div style={{ marginBottom: 12, color: '#444' }}>
          Selected: <strong>{formatPeriodLabel(selectedPeriod)}</strong>
        </div>
      ) : null}

      {loadError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
          <strong>Load error:</strong> {loadError}
        </div>
      ) : null}
      {logsError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
          <strong>Logs error:</strong> {logsError}
        </div>
      ) : null}
      {saveError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
          <strong>Save error:</strong> {saveError}
        </div>
      ) : null}
      {saveSuccess ? (
        <div style={{ padding: 12, background: '#efe', border: '1px solid #9c9', marginBottom: 12 }}>
          <strong>Success:</strong> {saveSuccess}
        </div>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0, marginBottom: 10 }}>BOH inputs</h3>

        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Employee</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Role</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Hours worked</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Role weight</th>
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
                const row = inputsByEmployeeId?.[emp.id] || {
                  hours_worked: '',
                  role_weight: String(defaultRoleWeightForEmployeeRole(emp.role))
                }

                return (
                  <tr key={emp.id}>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                      <div style={{ fontWeight: 600 }}>{emp.employee_code}</div>
                      {emp.display_name ? (
                        <div style={{ color: '#666', fontSize: 12 }}>{emp.display_name}</div>
                      ) : null}
                      <div style={{ color: '#aaa', fontSize: 11 }}>{emp.id}</div>
                    </td>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{emp.role}</td>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={row.hours_worked}
                        onChange={(e) => setEmployeeInput(emp.id, { hours_worked: e.target.value })}
                        disabled={isBusy || !selectedServicePeriodId}
                        style={{ width: 120 }}
                        placeholder="e.g. 4.5"
                      />
                    </td>
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={row.role_weight}
                        onChange={(e) => setEmployeeInput(emp.id, { role_weight: e.target.value })}
                        disabled={isBusy || !selectedServicePeriodId}
                        style={{ width: 120 }}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <button onClick={saveKitchenHours} disabled={isBusy || !selectedServicePeriodId}>
          {isSaving ? 'Saving…' : 'Save kitchen hours'}
        </button>
      </div>

      {selectedServicePeriodId ? (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 10 }}>Stored preview</h3>

          {isLoadingLogs ? (
            <div style={{ color: '#666' }}>Loading…</div>
          ) : storedLogs.length === 0 ? (
            <div style={{ color: '#666' }}>No kitchen hours stored for this service period.</div>
          ) : (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Employee</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Role</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Hours</th>
                  <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {storedLogs.map((l) => {
                  const emp = l?.employees || {}
                  const label = emp.employee_code || l.employee_id || '(unknown)'
                  return (
                    <tr key={l.id || `${l.service_period_id}-${l.employee_id}`}>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                        <div style={{ fontWeight: 600 }}>{label}</div>
                        {emp.display_name ? (
                          <div style={{ color: '#666', fontSize: 12 }}>{emp.display_name}</div>
                        ) : null}
                      </td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                        {emp.role || '(unknown)'}
                      </td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                        {Number(l.hours_worked).toFixed(2)}
                      </td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                        {Number(l.role_weight).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  )
}

