import type { ParentWeeklyReport } from '../../../mocks/seed'

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-5">
      <p className="text-[12px] text-black/50">{label}</p>
      <p className="mt-2 text-[18px] font-bold text-black">{value}</p>
      <p className="mt-2 text-[12px] text-black/45">{hint}</p>
    </article>
  )
}

export function ReportSummaryCards({ report }: { report: ParentWeeklyReport }) {
  const selfCorrectionHint =
    report.selfCorrectionDelta > 0
      ? `지난 주 대비 +${report.selfCorrectionDelta}회`
      : report.selfCorrectionDelta < 0
        ? `지난 주 대비 ${report.selfCorrectionDelta}회`
        : '지난 주와 동일'

  return (
    <section className="space-y-4">
      <h1 className="text-[16px] font-semibold text-black">주간 성장 리포트</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="이번 주 작성 횟수"
          value={`${report.postsThisWeek}회`}
          hint={
            report.postsThisWeek >= report.postsGoal
              ? `목표 ${report.postsGoal}회 달성`
              : `목표 ${report.postsGoal}회 중 ${report.postsThisWeek}회`
          }
        />
        <SummaryCard
          label="자기교정 완료"
          value={`${report.selfCorrections}회`}
          hint={selfCorrectionHint}
        />
        <SummaryCard
          label="반복 오류 유형"
          value={`${report.repeatedErrorTypeCount}종`}
          hint={report.repeatedErrorFocus}
        />
        <SummaryCard
          label="낮은 확신도 검토 대기"
          value={`${report.lowConfidencePending}건`}
          hint="확정 전 검토 필요"
        />
      </div>
    </section>
  )
}
