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

/**
 * Require full admin (manager) role.
 * Only role === 'manager' is allowed.
 */
export function requireManager(router) {
  const session = readSession()
  if (!session) {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
    router.push('/login')
    return false
  }
  if (session.role !== 'manager') {
    router.push('/dashboard')
    return false
  }
  return true
}

/**
 * Require kitchen manager OR full admin (manager) role.
 * Allows role === 'kitchen_manager' OR role === 'manager'.
 */
export function requireKitchenManager(router) {
  const session = readSession()
  if (!session) {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
    router.push('/login')
    return false
  }
  if (session.role !== 'kitchen_manager' && session.role !== 'manager') {
    router.push('/dashboard')
    return false
  }
  return true
}
