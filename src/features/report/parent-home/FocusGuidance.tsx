import type { ParentChildSummary } from '../../../mocks/seed'

export function FocusGuidance({ child }: { child: ParentChildSummary }) {
  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-5">
      <h3 className="mb-3 text-[16px] font-semibold text-black">{child.name} — 다음 집중 영역</h3>
      <p className="mb-3 text-[12px] leading-relaxed text-black/75">{child.focusGuidance}</p>
      <p className="text-[12px] font-medium text-black">추천 집중 영역: {child.focusArea}</p>
    </div>
  )
}
