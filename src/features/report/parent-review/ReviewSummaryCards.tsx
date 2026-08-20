export function ReviewSummaryCards({
  reviewCount,
  confirmedCount,
}: {
  reviewCount: number
  confirmedCount: number
}) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-[16px] font-semibold text-black">낮은 확신도 오류 검토</h1>
        <button type="button" className="mt-1 text-[12px] text-black/45 hover:text-black">
          이 화면 안내
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-[10px] border border-black/10 bg-white p-4">
          <p className="text-[12px] text-black/50">검토 대상</p>
          <p className="mt-2 text-[18px] font-bold text-black">{reviewCount}건</p>
        </article>
        <article className="rounded-[10px] border border-black/10 bg-white p-4">
          <p className="text-[12px] text-black/50">확정 오류</p>
          <p className="mt-2 text-[18px] font-bold text-black">{confirmedCount}건</p>
        </article>
        <article className="rounded-[10px] border border-black/10 bg-white p-4">
          <p className="text-[12px] text-black/50">자동 반영 여부</p>
          <p className="mt-2 text-[18px] font-bold text-black">반영 안 됨</p>
        </article>
      </div>
    </section>
  )
}
