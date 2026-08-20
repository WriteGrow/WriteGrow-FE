import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getChildWeeklyReport } from '../../lib/api'
import { LowConfidenceReview } from './parent-report/LowConfidenceReview'
import { PostRevisionTable } from './parent-report/PostRevisionTable'
import { RepeatedErrorStatus } from './parent-report/RepeatedErrorStatus'
import { ReportFocusSection } from './parent-report/ReportFocusSection'
import { ReportSummaryCards } from './parent-report/ReportSummaryCards'
import { WeeklyTrendTable } from './parent-report/WeeklyTrendTable'

function parseChildProfileId(value: string) {
  const normalized = value.replace(/^child-/, '')
  const profileId = Number(normalized)
  return Number.isFinite(profileId) && profileId > 0 ? profileId : null
}

export function ParentReport() {
  const { childId = '' } = useParams()
  const childProfileId = parseChildProfileId(childId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', childProfileId, 'weekly-report'],
    enabled: childProfileId !== null,
    queryFn: () => getChildWeeklyReport(childProfileId!),
  })

  if (childProfileId === null) {
    return <p className="text-[14px] text-red-700">아동 정보를 확인할 수 없어요.</p>
  }

  if (isLoading) {
    return <p className="text-[14px] text-black/50">불러오는 중...</p>
  }

  if (isError || !data) {
    return <p className="text-[14px] text-red-700">주간 리포트를 불러오지 못했어요.</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ReportSummaryCards report={data} />
      <RepeatedErrorStatus report={data} />
      <WeeklyTrendTable trends={data.dailyTrends} />
      <ReportFocusSection report={data} />
      <LowConfidenceReview
        childProfileId={data.profileId}
        pendingCount={data.summary.reviewPendingCount}
      />
      <PostRevisionTable childProfileId={data.profileId} />
    </div>
  )
}
