import { useState } from 'react'
import { useAccountStore } from '../../stores/accountStore'

/**
 * s1(로그인) 전이라 온보딩 후 계정 ID를 확인할 방법이 없었다.
 * 헤더의 빈 "프로" 자리를 이 정보 패널로 대체해, 다른 기기/브라우저에서
 * "이미 계정이 있으신가요?" 복구에 쓸 계정 ID를 언제든 다시 볼 수 있게 한다.
 */
export function ProfileInfo() {
  const [open, setOpen] = useState(false)
  const accountId = useAccountStore((s) => s.accountId)
  const parentProfileId = useAccountStore((s) => s.parentProfileId)
  const childProfileIds = useAccountStore((s) => s.childProfileIds)

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 rounded-[5px] border border-black/15 px-3 py-2 text-[14px] text-black/50 hover:bg-black/5"
      >
        프로필 보기
      </button>
      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 w-56 rounded-[10px] border border-black/10 bg-white p-4 text-[12px] shadow-sm">
          <p className="mb-2 font-semibold text-black">내 계정 정보</p>
          <dl className="space-y-1.5">
            <div className="flex justify-between gap-3">
              <dt className="text-black/50">계정 ID</dt>
              <dd className="font-medium text-black">{accountId ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-black/50">보호자 프로필 ID</dt>
              <dd className="font-medium text-black">{parentProfileId ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-black/50">아이 프로필 ID</dt>
              <dd className="font-medium text-black">
                {childProfileIds.length > 0 ? childProfileIds.join(', ') : '-'}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-black/40">
            다른 기기에서 온보딩 화면의 "이미 계정이 있으신가요?"에 계정 ID를 입력하면 이 계정을 다시 불러올 수 있어요.
          </p>
        </div>
      )}
    </div>
  )
}
