import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getWriting, getWritingErrors } from '../../lib/api'

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const writingId = postId ? Number(postId) : null
  const validWritingId = writingId !== null && Number.isInteger(writingId) && writingId >= 0 ? writingId : null

  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ['writings', validWritingId],
    queryFn: () => getWriting(validWritingId as number),
    enabled: validWritingId !== null,
  })

  const { data: errors } = useQuery({
    queryKey: ['writings', validWritingId, 'errors'],
    queryFn: () => getWritingErrors(validWritingId as number),
    enabled: validWritingId !== null,
  })

  if (isPostLoading) return <p className="text-body">불러오는 중...</p>
  if (!post) return <p className="text-body">글을 찾을 수 없어.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{post.topic}</h1>
      <p className="text-sm text-ink/60">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</p>

      <section className="rounded-xl bg-white p-4">
        <p className="text-body text-ink/80">{post.finalText ?? post.originalText}</p>
      </section>

      {errors && errors.status !== 'SUCCEEDED' && (
        <section className="rounded-xl bg-white p-4">
          <p className="text-body text-ink/70">
            {errors.status === 'FAILED' ? '분석에 실패했어요. 잠시 후 다시 확인해 주세요.' : '분석 중이에요. 잠시 후 다시 확인해 주세요.'}
          </p>
        </section>
      )}

      {errors?.status === 'SUCCEEDED' && errors.errors.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">고친 것들</h2>
          <ul className="space-y-2">
            {errors.errors.map((error) => (
              <li key={`${error.errorType}-${error.startIndex}`} className="rounded-lg bg-brand-soft p-3 text-body">
                {error.originalText} → {error.suggestion}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
