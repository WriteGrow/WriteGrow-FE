import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccountStore } from '../stores/accountStore'

/**
 * s1(인증) 전이라 계정/프로필 존재 여부를 온보딩 완료 대용으로 쓴다.
 * RoleGuard와 같은 패턴: 조건을 못 채우면 온보딩으로 돌려보낸다.
 */
export function AccountGate({ children }: { children: ReactNode }) {
  const ready = useAccountStore((s) => s.accountId !== null && s.childProfileIds.length > 0)
  if (!ready) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}
