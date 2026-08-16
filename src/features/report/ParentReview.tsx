import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import type { ParentReviewData } from '../../mocks/seed'
import { ReviewCandidateList } from './parent-review/ReviewCandidateList'
import { ReviewNotice } from './parent-review/ReviewNotice'
import { ReviewSummaryCards } from './parent-review/ReviewSummaryCards'

export function ParentReview() {
  const { childId = '' } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', childId, 'review'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<ParentReviewData> => {
      const res = await fetch(`/api/children/${childId}/review`)
      if (!res.ok) throw new Error('failed to load review')
      return res.json()
    },
  })

  if (isLoading) {
    return <p className="text-[14px] text-black/50">불러오는 중...</p>
  }

  if (isError || !data) {
    return <p className="text-[14px] text-red-700">검토 목록을 불러오지 못했어요.</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ReviewSummaryCards review={data} />
      <ReviewNotice />
      <ReviewCandidateList candidates={data.candidates} />
      <div className="flex justify-end">
        <Link
          to={`/parent/children/${childId}/report`}
          className="rounded-[5px] border border-black/15 bg-white px-4 py-2 text-[12px] text-black hover:bg-black/5"
        >
          주간 성장 리포트로 돌아가기
        </Link>
      </div>
    </div>
  )
}
