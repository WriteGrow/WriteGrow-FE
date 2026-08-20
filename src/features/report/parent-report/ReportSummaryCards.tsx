import type { WeeklyReportResponse } from '../../../lib/apiTypes'

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-5">
      <p className="text-[12px] text-black/50">{label}</p>
      <p className="mt-2 text-[18px] font-bold text-black">{value}</p>
      <p className="mt-2 text-[12px] text-black/45">{hint}</p>
    </article>
  )
}

export function ReportSummaryCards({ report }: { report: WeeklyReportResponse }) {
  const { summary } = report
  const selfCorrectionHint =
    summary.selfCorrectionDelta > 0
      ? `지난 주 대비 +${summary.selfCorrectionDelta}회`
      : summary.selfCorrectionDelta < 0
        ? `지난 주 대비 ${summary.selfCorrectionDelta}회`
        : '지난 주와 동일'

  const repeatedHint =
    report.repeatedErrors.length > 0
      ? report.repeatedErrors
          .slice(0, 2)
          .map((error) => error.label)
          .join('·') + ' 중심'
      : '반복 오류 없음'

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-[16px] font-semibold text-black">주간 성장 리포트</h1>
        <p className="mt-1 text-[12px] text-black/45">
          {report.nickname} · {report.weekStart} ~ {report.weekEnd}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="이번 주 작성 횟수"
          value={`${summary.writingCount}회`}
          hint={report.hasWriting ? `확정 ${summary.confirmedCount}편` : '이번 주 작성 없음'}
        />
        <SummaryCard
          label="자기교정 완료"
          value={`${summary.selfCorrectionCount}회`}
          hint={selfCorrectionHint}
        />
        <SummaryCard
          label="반복 오류 유형"
          value={`${summary.repeatedErrorTypeCount}종`}
          hint={repeatedHint}
        />
        <SummaryCard
          label="낮은 확신도 검토 대기"
          value={`${summary.reviewPendingCount}건`}
          hint="확정 전 검토 필요"
        />
      </div>
    </section>
  )
}
