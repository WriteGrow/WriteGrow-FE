import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getChildErrorReviews, getWritingErrorReview } from '../../lib/api'
import type { AggregatedChildErrorReview } from '../../lib/apiTypes'
import { ReviewCandidateList } from './parent-review/ReviewCandidateList'
import { ReviewNotice } from './parent-review/ReviewNotice'
import { ReviewSummaryCards } from './parent-review/ReviewSummaryCards'

function parseChildProfileId(value: string) {
  const normalized = value.replace(/^child-/, '')
  const profileId = Number(normalized)
  return Number.isFinite(profileId) && profileId > 0 ? profileId : null
}

export function ParentReview() {
  const { childId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const childProfileId = parseChildProfileId(childId)
  const writingIdFromQuery = Number(searchParams.get('writingId'))
  const hasWritingIdQuery =
    Number.isFinite(writingIdFromQuery) && writingIdFromQuery > 0 ? writingIdFromQuery : null

  const reviewQuery = useQuery({
    queryKey: hasWritingIdQuery
      ? ['writings', hasWritingIdQuery, 'error-review']
      : ['children', childProfileId, 'error-reviews'],
    enabled: childProfileId !== null,
    queryFn: async (): Promise<AggregatedChildErrorReview> => {
      if (hasWritingIdQuery !== null) {
        const review = await getWritingErrorReview(hasWritingIdQuery)
        return {
          reviewCount: review.reviewCount,
          confirmedCount: review.confirmedCount,
          candidates: review.reviewCandidates.map((candidate) => ({
            ...candidate,
            writingId: review.writingId,
            topic: '',
            analyzedText: review.analyzedText,
          })),
        }
      }
      return getChildErrorReviews(childProfileId!)
    },
  })

  if (childProfileId === null) {
    return <p className="text-[14px] text-red-700">아동 정보를 확인할 수 없어요.</p>
  }

  if (reviewQuery.isLoading) {
    return <p className="text-[14px] text-black/50">불러오는 중...</p>
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return <p className="text-[14px] text-red-700">검토 목록을 불러오지 못했어요.</p>
  }

  const review = reviewQuery.data

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ReviewSummaryCards
        reviewCount={review.reviewCount}
        confirmedCount={review.confirmedCount}
      />
      <ReviewNotice />
      <ReviewCandidateList candidates={review.candidates} />
      <div className="flex justify-end">
        <Link
          to={`/parent/children/${childProfileId}/report`}
          className="rounded-[5px] border border-black/15 bg-white px-4 py-2 text-[12px] text-black hover:bg-black/5"
        >
          주간 성장 리포트로 돌아가기
        </Link>
      </div>
    </div>
  )
}
