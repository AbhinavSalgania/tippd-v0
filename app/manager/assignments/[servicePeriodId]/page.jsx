'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'
import { supabase } from '@/lib/supabaseClient'
import { requireManager, requireKitchenManager } from '@/app/lib/requireRole'
function formatPeriodLabel(period) {
  if (!period) return ''
  return `${period.period_date} (${period.period_type})`
}

function normalizeStation(value) {
  const v = typeof value === 'string' ? value.trim() : ''
  return v.length > 0 ? v : null
}

export default function ManagerAssignmentsPage() {
  const router = useRouter()
  const params = useParams()
  const servicePeriodParam = params?.servicePeriodId
  const servicePeriodId = Array.isArray(servicePeriodParam) ? servicePeriodParam[0] : servicePeriodParam

  const [mounted, setMounted] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  const [period, setPeriod] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [employees, setEmployees] = useState([])
  const [allowedRolesByEmployeeId, setAllowedRolesByEmployeeId] = useState({})

  const [stationEditsByAssignmentId, setStationEditsByAssignmentId] = useState({})

  const [newServerEmployeeId, setNewServerEmployeeId] = useState('')
  const [newServerStation, setNewServerStation] = useState('')
  const [newBartenderEmployeeId, setNewBartenderEmployeeId] = useState('')
  const [newBartenderStation, setNewBartenderStation] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsAllowed(requireManager(router) ||requireKitchenManager(router))
  }, [mounted, router])

  const loadData = useCallback(async () => {
    if (!servicePeriodId) return
    setIsLoading(true)
    setLoadError(null)
    setActionError(null)
    setActionSuccess(null)

    try {
      const periodRes = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .eq('id', servicePeriodId)
        .single()

      if (periodRes.error) throw periodRes.error
      setPeriod(periodRes.data || null)

      const assignRes = await supabase
        .from('shift_assignments')
        .select('id, service_period_id, employee_id, worked_role, station, created_at, employees ( employee_code, display_name, role )')
        .eq('service_period_id', servicePeriodId)
        .order('worked_role', { ascending: true })
        .order('employee_id', { ascending: true })

      if (assignRes.error) throw assignRes.error
      const rows = Array.isArray(assignRes.data) ? assignRes.data : []
      setAssignments(rows)

      const nextStationEdits = {}
      for (const row of rows) {
        nextStationEdits[row.id] = row.station ?? ''
      }
      setStationEditsByAssignmentId(nextStationEdits)

      const rolesRes = await supabase
        .from('employee_allowed_roles')
        .select('employee_id, role, employees ( id, employee_code, display_name, is_active, role )')

      if (rolesRes.error) throw rolesRes.error
      const allowed = Array.isArray(rolesRes.data) ? rolesRes.data : []

      const nextAllowedByEmployeeId = {}
      const employeeById = {}

      for (const row of allowed) {
        if (!row?.employee_id) continue
        if (!nextAllowedByEmployeeId[row.employee_id]) nextAllowedByEmployeeId[row.employee_id] = new Set()
        nextAllowedByEmployeeId[row.employee_id].add(row.role)

        const emp = row.employees
        if (emp && emp.id) employeeById[emp.id] = emp
      }

      const employeeList = Object.values(employeeById)
        .filter((emp) => emp?.is_active)
        .sort((a, b) => {
          const ca = String(a.employee_code || '')
          const cb = String(b.employee_code || '')
          if (ca !== cb) return ca.localeCompare(cb)
          return String(a.id || '').localeCompare(String(b.id || ''))
        })

      setEmployees(employeeList)
      setAllowedRolesByEmployeeId(nextAllowedByEmployeeId)
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoading(false)
    }
  }, [servicePeriodId])

  useEffect(() => {
    if (!mounted || !isAllowed) return
    loadData()
  }, [loadData, mounted, isAllowed])

  const assignedEmployeeIds = useMemo(() => {
    return new Set(assignments.map((row) => row.employee_id))
  }, [assignments])

  const serverAssignments = useMemo(() => {
    return assignments.filter((row) => row.worked_role === 'server')
  }, [assignments])

  const bartenderAssignments = useMemo(() => {
    return assignments.filter((row) => row.worked_role === 'bartender')
  }, [assignments])

  const availableEmployeesForRole = useCallback(
    (role) => {
      return employees.filter((emp) => {
        const allowed = allowedRolesByEmployeeId[emp.id]
        if (!allowed || !allowed.has(role)) return false
        if (assignedEmployeeIds.has(emp.id)) return false
        return true
      })
    },
    [employees, allowedRolesByEmployeeId, assignedEmployeeIds]
  )

  const addAssignment = useCallback(
    async (role) => {
      const employeeId = role === 'server' ? newServerEmployeeId : newBartenderEmployeeId
      const station = role === 'server' ? newServerStation : newBartenderStation

      setActionError(null)
      setActionSuccess(null)

      if (!employeeId) {
        setActionError('Select an employee before adding an assignment.')
        return
      }

      try {
        const insertRes = await supabase
          .from('shift_assignments')
          .insert({
            service_period_id: servicePeriodId,
            employee_id: employeeId,
            worked_role: role,
            station: normalizeStation(station)
          })

        if (insertRes.error) throw insertRes.error

        if (role === 'server') {
          setNewServerEmployeeId('')
          setNewServerStation('')
        } else {
          setNewBartenderEmployeeId('')
          setNewBartenderStation('')
        }

        setActionSuccess('Assignment added.')
        await loadData()
      } catch (e) {
        setActionError(e?.message || String(e))
      }
    },
    [servicePeriodId, newServerEmployeeId, newBartenderEmployeeId, newServerStation, newBartenderStation, loadData]
  )

  const updateStation = useCallback(
    async (assignmentId) => {
      const nextStation = normalizeStation(stationEditsByAssignmentId[assignmentId])
      setActionError(null)
      setActionSuccess(null)
      try {
        const { error } = await supabase
          .from('shift_assignments')
          .update({ station: nextStation })
          .eq('id', assignmentId)

        if (error) throw error

        setActionSuccess('Station updated.')
        await loadData()
      } catch (e) {
        setActionError(e?.message || String(e))
      }
    },
    [stationEditsByAssignmentId, loadData]
  )

  const removeAssignment = useCallback(
    async (assignmentId) => {
      setActionError(null)
      setActionSuccess(null)
      try {
        const { error } = await supabase.from('shift_assignments').delete().eq('id', assignmentId)
        if (error) throw error
        setActionSuccess('Assignment removed.')
        await loadData()
      } catch (e) {
        setActionError(e?.message || String(e))
      }
    },
    [loadData]
  )

  if (!mounted || !isAllowed) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppHeader title="Manager" subtitle="Shift assignments" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600">Checking access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Manager" subtitle="Shift assignments" />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Service period</div>
              <div className="mt-1 text-xs text-zinc-500">{formatPeriodLabel(period) || 'Loading…'}</div>
              {servicePeriodId ? (
                <div className="mt-2 text-xs text-zinc-400">{servicePeriodId}</div>
              ) : null}
            </div>
            <button
              onClick={() => router.push('/manager/entries')}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Back to Entries
            </button>
          </div>

          {loadError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>
          ) : null}
        </div>

        {actionError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
        ) : null}
        {actionSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{actionSuccess}</div>
        ) : null}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Servers</div>
          <div className="mt-1 text-xs text-zinc-500">Assignments for server shifts (including cross-trained staff).</div>

          {isLoading ? (
            <div className="mt-4 text-sm text-zinc-600">Loading assignments…</div>
          ) : serverAssignments.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-600">No server assignments yet.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Station</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {serverAssignments.map((row) => {
                    const emp = row.employees || {}
                    const label = emp.display_name ? `${emp.employee_code} · ${emp.display_name}` : emp.employee_code
                    return (
                      <tr key={row.id}>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-zinc-900">{label || row.employee_id}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            value={stationEditsByAssignmentId[row.id] ?? ''}
                            onChange={(e) =>
                              setStationEditsByAssignmentId((prev) => ({
                                ...prev,
                                [row.id]: e.target.value
                              }))
                            }
                            placeholder="Patio / Dining / Bar"
                            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-900 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateStation(row.id)}
                              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => removeAssignment(row.id)}
                              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-3">
            <div className="text-xs font-semibold text-zinc-600">Add server assignment</div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Employee</div>
                <select
                  value={newServerEmployeeId}
                  onChange={(e) => setNewServerEmployeeId(e.target.value)}
                  className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="">Select employee</option>
                  {availableEmployeesForRole('server').map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_code} {emp.display_name ? `· ${emp.display_name}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Station</div>
                <input
                  type="text"
                  value={newServerStation}
                  onChange={(e) => setNewServerStation(e.target.value)}
                  placeholder="Patio / Dining / Bar"
                  className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </label>
              <button
                onClick={() => addAssignment('server')}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold">Bartenders</div>
          <div className="mt-1 text-xs text-zinc-500">Assignments for bartender shifts.</div>

          {isLoading ? (
            <div className="mt-4 text-sm text-zinc-600">Loading assignments…</div>
          ) : bartenderAssignments.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-600">No bartender assignments yet.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Station</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {bartenderAssignments.map((row) => {
                    const emp = row.employees || {}
                    const label = emp.display_name ? `${emp.employee_code} · ${emp.display_name}` : emp.employee_code
                    return (
                      <tr key={row.id}>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-zinc-900">{label || row.employee_id}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            value={stationEditsByAssignmentId[row.id] ?? ''}
                            onChange={(e) =>
                              setStationEditsByAssignmentId((prev) => ({
                                ...prev,
                                [row.id]: e.target.value
                              }))
                            }
                            placeholder="Bar 1 / Bar 2"
                            className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-zinc-900 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateStation(row.id)}
                              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => removeAssignment(row.id)}
                              className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-3">
            <div className="text-xs font-semibold text-zinc-600">Add bartender assignment</div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Employee</div>
                <select
                  value={newBartenderEmployeeId}
                  onChange={(e) => setNewBartenderEmployeeId(e.target.value)}
                  className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="">Select employee</option>
                  {availableEmployeesForRole('bartender').map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_code} {emp.display_name ? `· ${emp.display_name}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Station</div>
                <input
                  type="text"
                  value={newBartenderStation}
                  onChange={(e) => setNewBartenderStation(e.target.value)}
                  placeholder="Bar 1 / Bar 2"
                  className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </label>
              <button
                onClick={() => addAssignment('bartender')}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
