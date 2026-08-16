import type { ParentWeeklyReport } from '../../../mocks/seed'

export function ReportFocusSection({ report }: { report: ParentWeeklyReport }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">다음 집중 영역과 지도 우선순위</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[10px] border border-black/10 bg-white p-5">
          <p className="text-[12px] text-black/50">집중 권장 영역</p>
          <h3 className="mt-2 text-[16px] font-semibold text-black">{report.focusAreaTitle}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-black/50">
            {report.focusAreaDescription}
          </p>
        </article>
        <article className="rounded-[10px] border border-black/10 bg-white p-5">
          <p className="text-[12px] text-black/50">다음 우선 지도 방향</p>
          <h3 className="mt-2 text-[16px] font-semibold text-black">{report.guidanceTitle}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-black/50">
            {report.guidanceDescription}
          </p>
        </article>
      </div>
    </section>
  )
}
