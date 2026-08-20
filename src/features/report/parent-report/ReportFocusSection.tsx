import type { WeeklyReportResponse } from '../../../lib/apiTypes'

const FOCUS_REASON_LABELS: Record<string, string> = {
  MOST_REPEATED: '가장 많이 반복된 오류 유형입니다. 짧은 문장으로 함께 연습해 보세요.',
}

export function ReportFocusSection({ report }: { report: WeeklyReportResponse }) {
  const focus = report.nextFocus

  if (!focus) {
    return (
      <section className="space-y-4">
        <h2 className="text-[16px] font-semibold text-black">다음 집중 영역과 지도 우선순위</h2>
        <div className="rounded-[10px] border border-black/10 bg-white p-5">
          <p className="text-[12px] text-black/50">이번 주 추천 집중 영역이 아직 없어요.</p>
        </div>
      </section>
    )
  }

  const reasonText =
    FOCUS_REASON_LABELS[focus.reason] ?? '이번 주 학습에서 우선으로 살펴보면 좋은 영역입니다.'

  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">다음 집중 영역과 지도 우선순위</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[10px] border border-black/10 bg-white p-5">
          <p className="text-[12px] text-black/50">집중 권장 영역</p>
          <h3 className="mt-2 text-[16px] font-semibold text-black">{focus.label}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-black/50">{reasonText}</p>
        </article>
        <article className="rounded-[10px] border border-black/10 bg-white p-5">
          <p className="text-[12px] text-black/50">다음 우선 지도 방향</p>
          <h3 className="mt-2 text-[16px] font-semibold text-black">{focus.label} 연습</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-black/50">
            누적 {focus.basisValue}회 기준으로 우선 지도가 필요해요. 짧은 문장 쓰기를 격려해 주세요.
          </p>
        </article>
      </div>
    </section>
  )
}
