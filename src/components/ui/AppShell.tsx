import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RoleSwitcher } from './RoleSwitcher'

interface NavItem {
  label: string
  to?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: '아동 홈', to: '/child' },
  { label: '보호자 홈', to: '/parent' },
  { label: '교사 홈' }, // s5, 라우트 미구현
  { label: '보호자 설정' }, // s4, 라우트 미구현
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-surface text-ink">
      <header className="flex min-h-touch shrink-0 items-center justify-between gap-2 border-b border-ink/10 px-4 sm:px-6">
        <span className="shrink-0 text-lg font-bold text-brand">WriteGrow</span>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <input
            type="search"
            placeholder="검색"
            className="hidden rounded-lg border border-ink/10 px-3 py-1.5 text-sm sm:block"
          />
          <RoleSwitcher />
          <span className="hidden shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand sm:inline-block">
            프로
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-48 shrink-0 overflow-y-auto border-r border-ink/10 p-6 sm:block">
          <p className="mb-3 text-xs font-semibold text-ink/40">메뉴</p>
          <nav className="space-y-1 text-body">
            {NAV_ITEMS.map((item) =>
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`block rounded-lg px-2 py-1.5 ${
                    location.pathname.startsWith(item.to) ? 'font-semibold text-ink' : 'text-ink/70'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span key={item.label} className="block cursor-not-allowed px-2 py-1.5 text-ink/30">
                  {item.label}
                </span>
              ),
            )}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
