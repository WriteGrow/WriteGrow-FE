import { useQuery } from '@tanstack/react-query'
import { getParentHome } from '../../lib/api'
import { useAccountStore } from '../../stores/accountStore'
import { ActivityCard } from './parent-home/ActivityCard'
import { ErrorStats } from './parent-home/ErrorStats'
import { FocusGuidance } from './parent-home/FocusGuidance'

export function ParentHome() {
  const parentProfileId = useAccountStore((s) => s.parentProfileId)
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['parents', 'home', parentProfileId],
    queryFn: () => getParentHome(parentProfileId as number),
    enabled: parentProfileId !== null,
  })
  const summaries = data?.children

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-[16px] font-semibold text-black">우리 아이 이번 주 글쓰기</h1>
          <button type="button" className="text-[14px] text-black/50 hover:text-black">
            보호자 설정
          </button>
        </div>

        {isLoading && <p className="text-[14px] text-black/50">불러오는 중...</p>}
        {isError && <p className="text-[14px] text-red-700">요약을 불러오지 못했어요.</p>}

        {summaries && (
          <div className="grid gap-4 md:grid-cols-2">
            {summaries.map((child) => (
              <ActivityCard key={child.profileId} child={child} />
            ))}
          </div>
        )}
      </section>

      {summaries && (
        <>
          <section>
            <h2 className="mb-4 text-[16px] font-semibold text-black">
              오류 변화 추이 및 자기교정 현황
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {summaries.map((child) => (
                <ErrorStats key={child.profileId} child={child} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-[16px] font-semibold text-black">지도 우선순위 안내</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {summaries.map((child) => (
                <FocusGuidance key={child.profileId} child={child} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
