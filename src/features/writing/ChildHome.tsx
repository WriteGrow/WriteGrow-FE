import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { DEV_CHILD_ID } from '../../lib/devChild'
import { useWritingStore } from '../../stores/writingStore'
import type { Post } from '../../mocks/seed'

export function ChildHome() {
  const navigate = useNavigate()
  const resetWriting = useWritingStore((s) => s.reset)
  const { data: posts, isLoading } = useQuery({
    queryKey: ['children', DEV_CHILD_ID, 'posts'],
    queryFn: async (): Promise<Post[]> => {
      const res = await fetch(`/api/children/${DEV_CHILD_ID}/posts`)
      return res.json()
    },
  })

  function startWriting() {
    resetWriting()
    navigate('/child/write')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">안녕, 오늘도 글을 써볼까?</h1>
      <button
        type="button"
        onClick={startWriting}
        className="min-h-touch rounded-xl bg-brand px-6 text-body font-semibold text-white"
      >
        새 글 쓰기
      </button>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">이전 글</h2>
          <button type="button" onClick={() => navigate('/child/posts')} className="text-sm text-brand">
            전체 보기
          </button>
        </div>
        {isLoading && <p>불러오는 중...</p>}
        <ul className="space-y-2">
          {posts?.slice(0, 5).map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => navigate(`/child/posts/${post.id}`)}
                className="min-h-touch w-full rounded-lg bg-white p-4 text-left shadow-sm"
              >
                {post.title}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
