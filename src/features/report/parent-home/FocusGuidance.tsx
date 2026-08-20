import type { ParentHomeChild } from './errorTypeLabels'
import { errorTypeLabels } from './errorTypeLabels'

export function FocusGuidance({ child }: { child: ParentHomeChild }) {
  const types = errorTypeLabels(child.topErrorTypes)
  const focusArea = types[0] ?? '기초 맞춤법'
  const focusGuidance =
    types.length > 0
      ? `${types.join('·')} 오류가 반복되고 있어요. 짧은 문장을 함께 읽어보며 고치는 연습을 해보세요.`
      : '이번 주에는 확정된 반복 오류가 없어요. 꾸준한 글쓰기 습관을 이어가 보세요.'

  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-5">
      <h3 className="mb-3 text-[16px] font-semibold text-black">
        {child.nickname} — 다음 집중 영역
      </h3>
      <p className="mb-3 text-[12px] leading-relaxed text-black/75">{focusGuidance}</p>
      <p className="text-[12px] font-medium text-black">추천 집중 영역: {focusArea}</p>
    </div>
  )
}
