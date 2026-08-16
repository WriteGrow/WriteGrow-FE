import type { ParentPostDetail } from '../../../mocks/seed'

export function PostMetaCard({ post }: { post: ParentPostDetail }) {
  return (
    <section className="space-y-4">
      <h1 className="text-[16px] font-semibold text-black">글 수정 전후 열람</h1>
      <div className="grid gap-4 rounded-[10px] border border-black/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[12px] text-black/50">작성자</p>
          <p className="mt-1 text-[14px] font-medium text-black">
            {post.authorName} ({post.ageLabel})
          </p>
        </div>
        <div>
          <p className="text-[12px] text-black/50">작성일</p>
          <p className="mt-1 text-[14px] font-medium text-black">{post.writtenAtLabel}</p>
        </div>
        <div>
          <p className="text-[12px] text-black/50">글 제목</p>
          <p className="mt-1 text-[14px] font-medium text-black">{post.title}</p>
        </div>
        <div>
          <p className="text-[12px] text-black/50">제출 회차</p>
          <p className="mt-1 text-[14px] font-medium text-black">{post.submissionCount}회차</p>
        </div>
      </div>
    </section>
  )
}
