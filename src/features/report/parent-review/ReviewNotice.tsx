export function ReviewNotice() {
  return (
    <aside className="flex gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
      <div>
        <p className="text-[14px] font-semibold text-black">
          ⚠️ 아동 교정 및 확정 통계 미반영 안내
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-black/50">
          <p>아래 항목은 AI가 오류 가능성을 감지했지만 확신도가 낮은 후보입니다.</p>
          <p>
            확정 전까지 통계와 아동 교정 결과에 자동 반영되지 않으며, 보호자 또는 교사의 검토가
            필요합니다.
          </p>
        </p>
      </div>
    </aside>
  )
}
