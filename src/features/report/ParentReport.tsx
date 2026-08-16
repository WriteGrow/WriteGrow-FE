import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import type { ParentWeeklyReport } from '../../mocks/seed'
import { LowConfidenceReview } from './parent-report/LowConfidenceReview'
import { PostRevisionTable } from './parent-report/PostRevisionTable'
import { RepeatedErrorStatus } from './parent-report/RepeatedErrorStatus'
import { ReportFocusSection } from './parent-report/ReportFocusSection'
import { ReportSummaryCards } from './parent-report/ReportSummaryCards'
import { WeeklyTrendTable } from './parent-report/WeeklyTrendTable'

export function ParentReport() {
  const { childId = '' } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', childId, 'report', 'weekly'],
    enabled: Boolean(childId),
    queryFn: async (): Promise<ParentWeeklyReport> => {
      const res = await fetch(`/api/children/${childId}/report/weekly`)
      if (!res.ok) throw new Error('failed to load weekly report')
      return res.json()
    },
  })

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
      <WeeklyTrendTable trends={data.trends} />
      <ReportFocusSection report={data} />
      <LowConfidenceReview pendingCount={data.lowConfidencePending} />
      <PostRevisionTable posts={data.posts} />
    </div>
  )
}
