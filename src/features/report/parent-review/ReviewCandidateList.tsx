import type { AggregatedErrorReviewCandidate } from '../../../lib/apiTypes'

function CandidateCard({
  index,
  candidate,
}: {
  index: number
  candidate: AggregatedErrorReviewCandidate
}) {
  const confidencePercent = Math.round(candidate.confidence * 100)

  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-5">
      <p className="mb-4 text-[14px] font-semibold text-black">
        후보 {index + 1}
        {candidate.errorTypeLabel ? ` · ${candidate.errorTypeLabel}` : ''}
        {candidate.topic ? ` · ${candidate.topic}` : ''}
      </p>
      <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div>
            <p className="text-[12px] text-black/50">원문</p>
            <p className="mt-1 text-[12px] text-black">
              {candidate.analyzedText ?? candidate.originalText}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-black/50">AI 분석</p>
            <p className="mt-1 text-[12px] leading-relaxed text-black">
              {candidate.reason ?? '오류 가능성이 감지되었지만 확신도가 낮습니다.'}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-black/50">낮은 확신도 사유</p>
            <p className="mt-1 text-[12px] leading-relaxed text-black">
              확신도 {confidencePercent}%로 운영 기준 미달이라 아동 교정 대상에서 제외되었습니다.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-[8px] border border-black/10 bg-[#f3f4f6] p-4">
          <div>
            <p className="text-[12px] text-black/50">수정 전</p>
            <p className="mt-1 text-[12px] text-black">{candidate.originalText}</p>
          </div>
          <div>
            <p className="text-[12px] text-black/50">수정 후 (AI 제안)</p>
            <p className="mt-1 text-[12px] text-black">{candidate.suggestion}</p>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ReviewCandidateList({
  candidates,
}: {
  candidates: AggregatedErrorReviewCandidate[]
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">검토 대상 오류 후보</h2>
      {candidates.length === 0 ? (
        <div className="rounded-[10px] border border-black/10 bg-white px-5 py-8 text-center text-[12px] text-black/45">
          검토할 낮은 확신도 후보가 없어요.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <CandidateCard
              key={`${candidate.writingId}-${candidate.errorType}-${candidate.startIndex}-${candidate.endIndex}`}
              index={index}
              candidate={candidate}
            />
          ))}
        </div>
      )}
    </section>
  )
}
