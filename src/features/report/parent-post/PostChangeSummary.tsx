import type { ParentPostDetail } from '../../../mocks/seed'

export function PostChangeSummary({ post }: { post: ParentPostDetail }) {
  return (
    <section className="space-y-4 rounded-[10px] border border-black/10 bg-white p-5">
      <h2 className="text-[14px] font-semibold text-black">핵심 변화 요약</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-[10px] border border-black/10 p-3">
          <p className="text-[12px] text-black/50">수정된 항목</p>
          <p className="mt-2 text-[14px] font-bold text-black">{post.changedCount}곳</p>
        </article>
        <article className="rounded-[10px] border border-black/10 p-3">
          <p className="text-[12px] text-black/50">자기교정 완료</p>
          <p className="mt-2 text-[14px] font-bold text-black">
            {post.selfCorrectionDone} / {post.selfCorrectionTotal}
          </p>
        </article>
        <article className="rounded-[10px] border border-black/10 p-3">
          <p className="text-[12px] text-black/50">교정 유형</p>
          <p className="mt-2 text-[14px] font-bold text-black">{post.correctionTypes.join('·')}</p>
        </article>
      </div>

      <div>
        <p className="mb-3 text-[14px] font-semibold text-black">변화 내용</p>
        <ul className="space-y-2">
          {post.changes.map((change) => (
            <li
              key={`${change.original}-${change.corrected}`}
              className="rounded-[8px] border border-black/10 px-4 py-3 text-[12px] text-black"
            >
              <span className="text-black/50">{change.original}</span>
              <span className="mx-2 text-black/50">→</span>
              <span className="font-medium">{change.corrected}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] leading-relaxed text-black/50">{post.summaryNote}</p>
    </section>
  )
}
