import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getChildWritings, getParentHome } from '../../lib/api'
import { WritingHistoryList } from './parent-writings/WritingHistoryList'

function parseChildProfileId(value: string) {
  const normalized = value.replace(/^child-/, '')
  const profileId = Number(normalized)
  return Number.isFinite(profileId) && profileId > 0 ? profileId : null
}

export function ParentWritings() {
  const { childId = '' } = useParams()
  const childProfileId = parseChildProfileId(childId)

  const homeQuery = useQuery({
    queryKey: ['parents', 'home'],
    queryFn: getParentHome,
    enabled: childProfileId !== null,
  })

  const writingsQuery = useQuery({
    queryKey: ['children', childProfileId, 'writings', { page: 0, size: 20 }],
    enabled: childProfileId !== null,
    queryFn: () => getChildWritings(childProfileId!, { page: 0, size: 20 }),
  })

  if (childProfileId === null) {
    return <p className="text-[14px] text-red-700">아동 정보를 확인할 수 없어요.</p>
  }

  const child = homeQuery.data?.children.find((item) => item.profileId === childProfileId)
  const nickname = child?.nickname
  const writings = writingsQuery.data?.content ?? []
  const isLoading = homeQuery.isLoading || writingsQuery.isLoading
  const isError = writingsQuery.isError

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[16px] font-semibold text-black">
              {nickname ? `${nickname} 글 기록` : '글 기록'}
            </h1>
            <p className="mt-1 text-[12px] text-black/50">
              작성한 글을 최신순으로 모아 볼 수 있어요.
            </p>
          </div>
          <Link
            to={`/parent/children/${childProfileId}/report`}
            className="shrink-0 text-[12px] text-black/50 hover:text-black"
          >
            주간 리포트 보기
          </Link>
        </div>

        {isLoading && <p className="text-[14px] text-black/50">불러오는 중...</p>}
        {isError && <p className="text-[14px] text-red-700">글 기록을 불러오지 못했어요.</p>}
        {!isLoading && !isError && (
          <WritingHistoryList childProfileId={childProfileId} writings={writings} />
        )}
      </section>

      <div className="flex justify-end">
        <Link
          to="/parent"
          className="rounded-[5px] border border-black/15 bg-white px-4 py-2 text-[12px] text-black hover:bg-black/5"
        >
          보호자 홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
