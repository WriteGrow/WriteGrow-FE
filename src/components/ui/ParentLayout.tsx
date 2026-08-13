import type { ReactNode } from 'react'
import { RoleSwitcher } from './RoleSwitcher'

export function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-surface">
      <header className="flex min-h-touch items-center border-b border-ink/10 px-6">
        <span className="font-bold text-ink">WriteGrow · 보호자</span>
      </header>
      <main className="mx-auto max-w-2xl p-6">{children}</main>
      <RoleSwitcher />
    </div>
  )
}
