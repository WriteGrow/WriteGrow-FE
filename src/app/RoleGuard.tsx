import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useRoleStore, type Role } from '../stores/roleStore'

/**
 * MVP는 s1(인증)이 없어 roleStore 값을 세션 대용으로 쓴다.
 * 실제 로그인이 들어오면 이 컴포넌트만 세션 기반 검사로 교체하면 된다.
 */
export function RoleGuard({ allow, children }: { allow: Role; children: ReactNode }) {
  const role = useRoleStore((s) => s.role)
  if (role !== allow) {
    return <Navigate to={allow === 'child' ? '/parent' : '/child'} replace />
  }
  return <>{children}</>
}
