import type { ReactNode } from 'react'
import { AppShell } from './AppShell'

export function ChildLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
