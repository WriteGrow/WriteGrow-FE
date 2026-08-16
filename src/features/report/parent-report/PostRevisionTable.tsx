import type { WeeklyPostRow } from '../../../mocks/seed'

export function PostRevisionTable({ posts }: { posts: WeeklyPostRow[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">개별 글 수정 전후 열람</h2>
      <div className="overflow-x-auto rounded-[10px] border border-black/10 bg-white p-5">
        <div className="overflow-hidden rounded-[10px] border border-black/10">
          <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-black/10 bg-[#f3f4f6] text-black/50">
                <th className="px-4 py-2.5 font-medium">작성일</th>
                <th className="px-4 py-2.5 font-medium">글 제목</th>
                <th className="px-4 py-2.5 font-medium">오류 수</th>
                <th className="px-4 py-2.5 font-medium">자기교정</th>
                <th className="px-4 py-2.5 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.postId} className="border-b border-black/10 last:border-b-0">
                  <td className="px-4 py-2">{post.writtenAt}</td>
                  <td className="px-4 py-2">{post.title}</td>
                  <td className="px-4 py-2">{post.errorCount}</td>
                  <td className="px-4 py-2">{post.selfCorrections}</td>
                  <td className="px-4 py-2">{post.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="text-[12px] text-black/50 hover:text-black cursor-pointer"
          >
            수정 전후 열람
          </button>
        </div>
      </div>
    </section>
  )
}
