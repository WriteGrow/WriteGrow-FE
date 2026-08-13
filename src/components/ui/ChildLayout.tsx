import type { ReactNode } from 'react'
import { RoleSwitcher } from './RoleSwitcher'

export function ChildLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-brand-soft text-body">
      <header className="flex min-h-touch items-center bg-brand px-6 text-white">
        <span className="font-bold">WriteGrow</span>
      </header>
      <main className="p-6">{children}</main>
      <RoleSwitcher />
    </div>
  )
}
