import type { WeeklyReportResponse } from '../../../lib/apiTypes'

export function RepeatedErrorStatus({ report }: { report: WeeklyReportResponse }) {
  const { summary, repeatedErrors } = report
  const cumulative = repeatedErrors.reduce((total, error) => total + error.cumulativeCount, 0)

  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">반복 오류와 자기교정 현황</h2>
      <div className="rounded-[10px] border border-black/10 bg-white p-5">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-[12px] text-black/50">주요 반복 오류</p>
            {repeatedErrors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {repeatedErrors.map((error) => (
                  <span
                    key={error.errorType}
                    className="rounded-full border border-black/10 px-3 py-1 text-[12px] text-black"
                  >
                    {error.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-black/45">이번 주 반복 오류가 없어요.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-[12px] text-black/50">자기교정 현황</p>
            <p className="text-[12px] text-black/50">
              이번 주 자기교정 {summary.selfCorrectionCount}회 완료
              {summary.selfCorrectionDelta !== 0 &&
                ` (지난 주 대비 ${summary.selfCorrectionDelta > 0 ? '+' : ''}${summary.selfCorrectionDelta}회)`}
            </p>
            <p className="mt-2 text-[12px] text-black/50">
              확정 오류 {summary.confirmedErrorCount}건
              {cumulative > 0 && ` · 반복 오류 누적 ${cumulative}회`}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
