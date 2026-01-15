'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const SESSION_KEY = 'tippd_session'

function readSession() {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const ok =
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.employeeId === 'string' &&
      typeof parsed.employeeCode === 'string' &&
      typeof parsed.role === 'string'
    return ok ? parsed : null
  } catch {
    return null
  }
}

export default function HomePage() {
  const router = useRouter()

  const [employeeCode, setEmployeeCode] = useState('')
  const [pin, setPin] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isDev = process.env.NODE_ENV === 'development'
  const debugSessionRaw = useMemo(() => {
    if (!isDev || typeof window === 'undefined') return null
    return window.sessionStorage.getItem(SESSION_KEY)
  }, [isDev, isSubmitting])

  useEffect(() => {
    const session = readSession()
    if (session) router.push('/dashboard')
    else if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
  }, [router])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    const code = employeeCode.trim()
    const pinValue = pin.trim()

    if (!code || !pinValue) {
      setError('Enter employee code and PIN.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error: queryError } = await supabase
        .from('employees')
        .select('id, employee_code, display_name, role, is_active')
        .eq('employee_code', code)
        .eq('pin', pinValue)
        .eq('is_active', true)
        .single()

      if (queryError || !data) {
        setError('Invalid code or PIN')
        return
      }

      const session = {
        employeeId: data.id,
        employeeCode: data.employee_code,
        displayName: data.display_name,
        role: data.role,
      }

      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      router.push('/dashboard')
    } catch (err) {
      setError(err?.message || String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Employee Login</h1>
          <p className="mt-1 text-sm text-zinc-600">Enter your employee code and PIN.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-800">Employee code</label>
              <input
                type="text"
                autoComplete="username"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-900"
                placeholder="e.g. S001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">PIN</label>
              <input
                type="password"
                autoComplete="current-password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-900"
                placeholder="••••"
              />
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </form>

          {isDev ? (
            <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="text-xs font-semibold text-zinc-700">Debug (dev only)</div>
              <div className="mt-2 text-xs text-zinc-700">
                <div className="font-mono whitespace-pre-wrap break-words">
                  {debugSessionRaw || '(empty)'}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

