// Client helper for MVP route-guarding (no real auth).
// IMPORTANT: Call `requireManager(router)` only inside a useEffect after mount.

export const SESSION_KEY = 'tippd_session'

export function readSession() {
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

export function requireManager(router) {
  const session = readSession()
  if (!session) {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
    router.push('/')
    return false
  }
  if (session.role !== 'kitchen_manager') {
    router.push('/dashboard')
    return false
  }
  return true
}

