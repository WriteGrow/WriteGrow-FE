import type { ParentWritingDetailResponse } from '../../../lib/apiTypes'

export function PostChangeSummary({ writing }: { writing: ParentWritingDetailResponse }) {
  const confirmedErrors = writing.confirmedErrors
  const correctionTypes = [...new Set(confirmedErrors.map((error) => error.errorTypeLabel))]
  const summaryNote =
    writing.reviewPendingCount > 0
      ? `확정 오류 ${confirmedErrors.length}곳 · 낮은 확신도 후보 ${writing.reviewPendingCount}건이 남아 있어요.`
      : `확정 오류 ${confirmedErrors.length}곳을 반영한 수정본입니다. 원문의 표현은 그대로 유지됩니다.`

  return (
    <section className="space-y-4 rounded-[10px] border border-black/10 bg-white p-5">
      <h2 className="text-[14px] font-semibold text-black">핵심 변화 요약</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-[10px] border border-black/10 p-3">
          <p className="text-[12px] text-black/50">수정된 항목</p>
          <p className="mt-2 text-[14px] font-bold text-black">{confirmedErrors.length}곳</p>
        </article>
        <article className="rounded-[10px] border border-black/10 p-3">
          <p className="text-[12px] text-black/50">자기교정 완료</p>
          <p className="mt-2 text-[14px] font-bold text-black">
            {writing.selfCorrectionCount} / {confirmedErrors.length}
          </p>
        </article>
        <article className="rounded-[10px] border border-black/10 p-3">
          <p className="text-[12px] text-black/50">교정 유형</p>
          <p className="mt-2 text-[14px] font-bold text-black">
            {correctionTypes.length > 0 ? correctionTypes.join('·') : '-'}
          </p>
        </article>
      </div>

      <div>
        <p className="mb-3 text-[14px] font-semibold text-black">변화 내용</p>
        {confirmedErrors.length === 0 ? (
          <p className="text-[12px] text-black/50">표시할 확정 오류가 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {confirmedErrors.map((error) => (
              <li
                key={`${error.startIndex}-${error.endIndex}-${error.originalText}`}
                className="rounded-[8px] border border-black/10 px-4 py-3 text-[12px] text-black"
              >
                <span className="text-black/50">{error.originalText}</span>
                <span className="mx-2 text-black/50">→</span>
                <span className="font-medium">{error.suggestion}</span>
                {error.errorTypeLabel ? (
                  <span className="ml-2 text-black/40">({error.errorTypeLabel})</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-black/50">{summaryNote}</p>
    </section>
  )
}
