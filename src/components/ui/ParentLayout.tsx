import type { ReactNode } from 'react'
import { AppShell } from './AppShell'

export function ParentLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
