import { useQuery } from '@tanstack/react-query'
import type { Post } from '../../mocks/seed'

// s1(인증) 전이라 로그인된 아동을 가정할 수 없다. 개발 단계 임시 고정값.
const DEV_CHILD_ID = 'child-1'

export function ChildHome() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['children', DEV_CHILD_ID, 'posts'],
    queryFn: async (): Promise<Post[]> => {
      const res = await fetch(`/api/children/${DEV_CHILD_ID}/posts`)
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">안녕, 오늘도 글을 써볼까?</h1>
      <button
        type="button"
        className="min-h-touch rounded-xl bg-brand px-6 text-body font-semibold text-white"
      >
        새 글 쓰기
      </button>
      <section>
        <h2 className="mb-2 font-semibold">이전 글</h2>
        {isLoading && <p>불러오는 중...</p>}
        <ul className="space-y-2">
          {posts?.map((post) => (
            <li key={post.id} className="rounded-lg bg-white p-4 shadow-sm">
              {post.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
