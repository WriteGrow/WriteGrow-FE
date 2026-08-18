import { useNavigate } from 'react-router-dom'
import { useRoleStore } from '../../stores/roleStore'

/** 개발 전용: s1(로그인) 없이 아동/보호자 화면을 오가며 확인하기 위한 스위처. */
export function RoleSwitcher() {
  const role = useRoleStore((s) => s.role)
  const setRole = useRoleStore((s) => s.setRole)
  const navigate = useNavigate()

  function switchTo(next: 'child' | 'parent') {
    setRole(next)
    navigate(next === 'child' ? '/child' : '/parent')
  }

  return (
    <div className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-ink/90 p-1 text-sm text-white">
      <span className="hidden pl-2 pr-1 text-xs text-white/60 sm:inline">역할 선택</span>
      <button
        type="button"
        onClick={() => switchTo('child')}
        className={`rounded-full px-3 py-1 ${role === 'child' ? 'bg-brand' : ''}`}
      >
        아동
      </button>
      <button
        type="button"
        onClick={() => switchTo('parent')}
        className={`rounded-full px-3 py-1 ${role === 'parent' ? 'bg-brand' : ''}`}
      >
        보호자
      </button>
    </div>
  )
}
