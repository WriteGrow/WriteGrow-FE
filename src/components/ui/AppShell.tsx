import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRoleStore, type Role } from '../../stores/roleStore'
import { RoleSwitcher } from './RoleSwitcher'

interface NavItem {
  label: string
  to?: string
  role?: Role
}

const NAV_ITEMS: NavItem[] = [
  { label: '아동 홈', to: '/child', role: 'child' },
  { label: '보호자 홈', to: '/parent', role: 'parent' },
  { label: '교사 홈' }, // s5, 라우트 미구현
  { label: '보호자 설정' }, // s4, 라우트 미구현
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const setRole = useRoleStore((s) => s.setRole)

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#f3f4f6] text-black">
      <header className="flex min-h-touch shrink-0 items-center justify-between gap-2 border-b border-black/10 bg-white px-4 sm:px-6">
        <span className="shrink-0 text-lg font-bold tracking-tight text-black">WriteGrow</span>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <input
            type="search"
            placeholder="검색"
            className="hidden rounded-[5px] border border-black/15 px-3 py-1.5 text-sm placeholder:text-black/40 sm:block"
          />
          <RoleSwitcher />
          <span className="hidden shrink-0 rounded-[5px] border border-black/15 px-3 py-2 text-[14px] text-black/50 sm:inline-block">
            프로
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-48 shrink-0 overflow-y-auto border-r border-black/10 bg-white p-6 sm:block">
          <p className="mb-3 text-xs font-semibold text-black/40">메뉴</p>
          <nav className="space-y-1 text-body">
            {NAV_ITEMS.map((item) => {
              if (!item.to) {
                return (
                  <span
                    key={item.label}
                    className="block cursor-not-allowed rounded-md px-3 py-2.5 text-sm text-black/35"
                    title="곧 제공 예정"
                  >
                    {item.label}
                  </span>
                )
              }
              const isActive = location.pathname.startsWith(item.to)
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.role) setRole(item.role)
                    navigate(item.to!)
                  }}
                  className={`block w-full rounded-md px-3 py-2.5 text-left text-sm ${
                    isActive ? 'bg-brand font-semibold text-white' : 'text-black/80 hover:bg-black/5'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
