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
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => switchTo('child')}
        className={`shrink-0 rounded-[5px] border px-3 py-2 text-[14px] ${
          role === 'child' ? 'border-black bg-black text-white' : 'border-black/15 text-black/50 hover:bg-black/5'
        }`}
      >
        아동
      </button>
      <button
        type="button"
        onClick={() => switchTo('parent')}
        className={`shrink-0 rounded-[5px] border px-3 py-2 text-[14px] ${
          role === 'parent' ? 'border-black bg-black text-white' : 'border-black/15 text-black/50 hover:bg-black/5'
        }`}
      >
        보호자
      </button>
    </div>
  )
}
