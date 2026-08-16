import type { ParentWeeklyReport } from '../../../mocks/seed'

export function RepeatedErrorStatus({ report }: { report: ParentWeeklyReport }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">반복 오류와 자기교정 현황</h2>
      <div className="rounded-[10px] border border-black/10 bg-white p-5">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-[12px] text-black/50">주요 반복 오류</p>
            <div className="flex flex-wrap gap-2">
              {report.majorRepeatedErrors.map((error) => (
                <span
                  key={error}
                  className="rounded-full border border-black/10 px-3 py-1 text-[12px] text-black"
                >
                  {error}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12px] text-black/50">자기교정 현황</p>
            <p className="text-[12px] text-black/50">
              이번 주 교정 대상 {report.correctionTarget}건 중 {report.correctionDone}건 완료
            </p>
            <p className="mt-2 text-[12px] text-black/50">
              누적 자기교정 성공 {report.cumulativeSelfCorrections}회
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
