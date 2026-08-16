import type { ReactNode } from 'react'
import { FiSearch } from 'react-icons/fi'
import { NavLink, useNavigate } from 'react-router-dom'
import { useRoleStore } from '../../stores/roleStore'
import { RoleSwitcher } from './RoleSwitcher'

const navItems = [
  { label: '아동 홈', to: '/child', role: 'child' as const },
  { label: '보호자 홈', to: '/parent', role: 'parent' as const },
  { label: '교사 홈', to: null, role: null },
  { label: '보호자 설정', to: null, role: null },
]

export function ParentLayout({ children }: { children: ReactNode }) {
  const setRole = useRoleStore((s) => s.setRole)
  const navigate = useNavigate()

  function goChild() {
    setRole('child')
    navigate('/child')
  }

  return (
    <div className="flex min-h-svh bg-[#f3f4f6]">
      <aside className="flex w-44 shrink-0 flex-col border-r border-ink/10 bg-white px-3 py-5">
        <p className="mb-6 px-2 text-lg font-bold tracking-tight text-black">글쑥쑥</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            if (item.role === 'child') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={goChild}
                  className="rounded-md px-3 py-2.5 text-left text-sm text-black/80 hover:bg-black/5"
                >
                  {item.label}
                </button>
              )
            }
            if (item.to) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-2.5 text-sm',
                      isActive
                        ? 'bg-brand font-semibold text-white'
                        : 'text-black/80 hover:bg-black/5',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              )
            }
            return (
              <span
                key={item.label}
                className="cursor-not-allowed rounded-md px-3 py-2.5 text-sm text-black/35"
                title="곧 제공 예정"
              >
                {item.label}
              </span>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 items-center justify-end gap-3 border-b border-black/10 bg-white px-6">
          <label className="relative w-full max-w-xs">
            <span className="sr-only">검색</span>
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40"
            />
            <input
              type="search"
              placeholder="검색"
              className="w-full rounded-[5px] border border-black/15 bg-white py-2 pl-9 pr-3 text-[14px] outline-none placeholder:text-black/40 focus:border-brand"
            />
          </label>
          <button
            type="button"
            onClick={goChild}
            className="shrink-0 rounded-[5px] border border-black/15 px-3 py-2 text-[14px] text-black/50 hover:bg-black/5"
          >
            역할 선택
          </button>
          <button
            type="button"
            className="shrink-0 rounded-[5px] border border-black/15 px-3 py-2 text-[14px] text-black/50"
          >
            프로
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <RoleSwitcher />
    </div>
  )
}
