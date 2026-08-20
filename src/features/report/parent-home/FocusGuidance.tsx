import type { ChildCard } from '../../../lib/apiTypes'

function deltaLabel(delta: number) {
  if (delta < 0) return `${Math.abs(delta)}건 감소`
  if (delta > 0) return `${delta}건 증가`
  return '변화 없음'
}

export function FocusGuidance({ child }: { child: ChildCard }) {
  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-5">
      <h3 className="mb-3 text-[16px] font-semibold text-black">{child.nickname} — 다음 집중 영역</h3>
      <p className="mb-3 text-[12px] leading-relaxed text-black/75">
        이번 주 오류 {child.weeklyErrorCount}개, 지난주 대비 {deltaLabel(child.errorCountDelta)}예요.
      </p>
      {child.topErrorTypes.length > 0 && (
        <p className="text-[12px] font-medium text-black">
          추천 집중 영역: {child.topErrorTypes.join(', ')}
        </p>
      )}
    </div>
  )
}
