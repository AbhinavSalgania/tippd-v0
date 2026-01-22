'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { readSession, SESSION_KEY } from '@/app/lib/requireRole'

export default function AppHeader({ title, subtitle }) {
  const router = useRouter()
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState(null)
  const [kitchenDropdownOpen, setKitchenDropdownOpen] = useState(false)
  const desktopDropdownRef = useRef(null)
  const mobileDropdownRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setSession(readSession())
  }, [mounted])

  // Close dropdown on navigation
  useEffect(() => {
    setKitchenDropdownOpen(false)
  }, [pathname])

  const role = session?.role || ''

  const links = useMemo(() => {
    if (!session) return []

    // Full admin (manager): all routes - Today's Service is primary
    if (role === 'manager') {
      return [
        { href: '/manager', label: 'Today' },
        { href: '/manager/entries', label: 'Entries' },
        { href: '/manager/summary', label: 'Summary' }
      ]
    }

    // Kitchen manager: BOH-only routes
    if (role === 'kitchen_manager') {
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/manager/kitchen-hours', label: 'Kitchen hours' },
        { href: '/manager/kitchen-weekly', label: 'Kitchen weekly' }
      ]
    }

    // Server / bartender / other: dashboard only
    return [{ href: '/dashboard', label: 'Dashboard' }]
  }, [session, role])

  const kitchenLinks = useMemo(() => {
    return [
      { href: '/manager/kitchen-hours', label: 'Kitchen Hours' },
      { href: '/manager/kitchen-weekly', label: 'Kitchen Weekly' }
    ]
  }, [])

  const employeeLabel = useMemo(() => {
    if (!session) return ''
    const code = session.employeeCode || ''
    const name = session.displayName || ''
    return name ? `${code} · ${name}` : code
  }, [session])

  const onLogout = () => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-semibold text-zinc-900">Tippd</div>
            {title ? <div className="text-xs text-zinc-500">{title}</div> : null}
          </div>
          {subtitle ? <div className="truncate text-xs text-zinc-500">{subtitle}</div> : null}
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(`${l.href}/`)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                  active ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
          
          {/* Kitchen dropdown for managers */}
          {role === 'manager' && (
            <div
              className="relative"
              ref={desktopDropdownRef}
              onMouseEnter={() => setKitchenDropdownOpen(true)}
              onMouseLeave={() => setKitchenDropdownOpen(false)}
            >
              <button
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                  pathname?.startsWith('/manager/kitchen-')
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Kitchen
                <svg
                  className={`h-3 w-3 transition-transform ${
                    kitchenDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {kitchenDropdownOpen && (
                <>
                  {/* Invisible bridge to maintain hover */}
                  <div className="absolute right-0 top-full h-1 w-full" />
                  <div className="absolute right-0 top-full pt-1 w-48">
                    <div className="rounded-lg border border-zinc-200 bg-white shadow-lg">
                      {kitchenLinks.map((l) => {
                        const active = pathname === l.href || pathname?.startsWith(`${l.href}/`)
                        return (
                          <Link
                            key={l.href}
                            href={l.href}
                            className={`block rounded-md px-3 py-2 text-xs font-medium transition first:rounded-t-lg last:rounded-b-lg ${
                              active
                                ? 'bg-zinc-900 text-white'
                                : 'text-zinc-700 hover:bg-zinc-100'
                            }`}
                            onClick={() => setKitchenDropdownOpen(false)}
                          >
                            {l.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && session ? (
            <div className="hidden max-w-[220px] truncate rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 sm:block">
              {employeeLabel || '—'}
            </div>
          ) : null}

          {mounted && session ? (
            <button
              onClick={onLogout}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Logout
            </button>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {mounted && session ? (
        <div className="border-t border-zinc-200 bg-white sm:hidden">
          <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 py-2">
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(`${l.href}/`)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                    active ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
            
            {/* Kitchen dropdown for managers (mobile) */}
            {role === 'manager' && (
              <div
                className="relative"
                ref={mobileDropdownRef}
                onMouseEnter={() => setKitchenDropdownOpen(true)}
                onMouseLeave={() => setKitchenDropdownOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
                    pathname?.startsWith('/manager/kitchen-')
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Kitchen
                  <svg
                    className={`h-3 w-3 transition-transform ${
                      kitchenDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                {kitchenDropdownOpen && (
                  <>
                    {/* Invisible bridge to maintain hover */}
                    <div className="absolute left-0 top-full h-1 w-full" />
                    <div className="absolute left-0 top-full pt-1 w-48 z-50">
                      <div className="rounded-lg border border-zinc-200 bg-white shadow-lg">
                        {kitchenLinks.map((l) => {
                          const active = pathname === l.href || pathname?.startsWith(`${l.href}/`)
                          return (
                            <Link
                              key={l.href}
                              href={l.href}
                              className={`block rounded-md px-3 py-2 text-xs font-medium transition first:rounded-t-lg last:rounded-b-lg ${
                                active
                                  ? 'bg-zinc-900 text-white'
                                  : 'text-zinc-700 hover:bg-zinc-100'
                              }`}
                              onClick={() => setKitchenDropdownOpen(false)}
                            >
                              {l.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

