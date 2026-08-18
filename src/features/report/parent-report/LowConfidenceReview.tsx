import { Link } from 'react-router-dom'

export function LowConfidenceReview({
  childId,
  pendingCount,
}: {
  childId: string
  pendingCount: number
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">낮은 확신도 오류 검토</h2>
      <div className="flex flex-col gap-4 rounded-[10px] border border-black/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl space-y-1 text-[12px] leading-relaxed text-black/50">
          <p>AI 판단 확신도가 낮은 오류 후보 {pendingCount}건이 검토를 기다리고 있습니다.</p>
          <p>확정 전 보호자가 직접 확인하여 아동 교정에 반영 여부를 결정합니다.</p>
        </div>
        <Link
          to={`/parent/children/${childId}/review`}
          className="shrink-0 rounded-[5px] bg-black px-4 py-2 text-center text-[12px] font-semibold text-white hover:bg-black/90"
        >
          낮은 확신도 오류 검토하기
        </Link>
      </div>
    </section>
  )
}
