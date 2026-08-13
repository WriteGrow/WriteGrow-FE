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
    <div className="fixed bottom-4 right-4 flex gap-2 rounded-full bg-ink/90 p-1 text-sm text-white shadow-lg">
      <button
        type="button"
        onClick={() => switchTo('child')}
        className={`rounded-full px-4 py-2 ${role === 'child' ? 'bg-brand' : ''}`}
      >
        아동
      </button>
      <button
        type="button"
        onClick={() => switchTo('parent')}
        className={`rounded-full px-4 py-2 ${role === 'parent' ? 'bg-brand' : ''}`}
      >
        보호자
      </button>
    </div>
  )
}
