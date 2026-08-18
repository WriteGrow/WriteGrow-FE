import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import type { ErrorItem, Post } from '../../mocks/seed'

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>()

  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: async (): Promise<Post> => {
      const res = await fetch(`/api/posts/${postId}`)
      return res.json()
    },
  })

  const { data: errors } = useQuery({
    queryKey: ['posts', postId, 'errors'],
    queryFn: async (): Promise<ErrorItem[]> => {
      const res = await fetch(`/api/posts/${postId}/errors`)
      return res.json()
    },
  })

  if (isPostLoading) return <p className="text-[14px] text-black/70">불러오는 중...</p>
  if (!post) return <p className="text-[14px] text-black/70">글을 찾을 수 없어.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-[16px] font-semibold text-black">{post.title}</h1>
      <p className="text-[12px] text-black/50">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</p>

      <section className="rounded-[10px] border border-black/10 bg-white p-5">
        <p className="text-[14px] text-black/80">{post.content}</p>
      </section>

      {errors && errors.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-black">고친 것들</h2>
          <ul className="space-y-2">
            {errors.map((error) => (
              <li key={error.id} className="rounded-[10px] border border-black/10 bg-white p-3 text-[14px]">
                {error.original} → {error.suggestion}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
