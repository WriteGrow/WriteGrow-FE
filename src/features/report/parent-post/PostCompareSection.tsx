import type { ParentPostDetail } from '../../../mocks/seed'

export function PostCompareSection({ post }: { post: ParentPostDetail }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-[10px] border border-black/10 bg-white p-5">
        <h2 className="mb-3 text-[14px] font-semibold text-black">수정 전 원문</h2>
        <div className="min-h-30 rounded-[8px] border border-black/10 bg-[#f3f4f6] p-4 text-[12px] leading-relaxed text-black">
          {post.originalContent}
        </div>
        <p className="mt-3 text-[10px] text-black/50">
          * 아동이 직접 작성한 원문 그대로 보존됩니다.
        </p>
      </article>

      <article className="rounded-[10px] border border-black/10 bg-white p-5">
        <h2 className="mb-3 text-[14px] font-semibold text-black">최종 수정본</h2>
        <div className="min-h-30 rounded-[8px] border border-black/10 bg-[#f3f4f6] p-4 text-[12px] leading-relaxed text-black">
          {post.revisedContent}
        </div>
        <p className="mt-3 text-[10px] text-black/50">* 아동이 자기교정을 완료한 최종본입니다.</p>
      </article>
    </section>
  )
}
