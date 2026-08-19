import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { DEV_CHILD_ID } from '../../lib/devChild'
import type { Post } from '../../mocks/seed'

export function PostList() {
  const navigate = useNavigate()
  const { data: posts, isLoading } = useQuery({
    queryKey: ['children', DEV_CHILD_ID, 'posts'],
    queryFn: async (): Promise<Post[]> => {
      const res = await fetch(`/api/children/${DEV_CHILD_ID}/posts`)
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-[16px] font-semibold text-black">이전 글</h1>
      {isLoading && <p className="text-[12px] text-black/50">불러오는 중...</p>}
      <ul className="space-y-2">
        {posts?.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              onClick={() => navigate(`/child/posts/${post.id}`)}
              className="w-full rounded-[10px] border border-black/10 bg-white p-4 text-left"
            >
              <p className="text-[14px] font-semibold text-black">{post.title}</p>
              <p className="text-[12px] text-black/50">
                {new Date(post.createdAt).toLocaleDateString('ko-KR')} · 고친 것 {post.errorCount}개
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
