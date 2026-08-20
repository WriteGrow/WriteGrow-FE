import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getWriting, getWritingErrors } from '../../lib/api'

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const writingId = postId ? Number(postId) : null
  const validWritingId = writingId !== null && Number.isInteger(writingId) && writingId > 0 ? writingId : null

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

  if (isPostLoading) return <p className="text-[14px] text-black/70">불러오는 중...</p>
  if (!post) return <p className="text-[14px] text-black/70">글을 찾을 수 없어.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-[16px] font-semibold text-black">{post.topic}</h1>
      <p className="text-[12px] text-black/50">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</p>

      <section className="rounded-[10px] border border-black/10 bg-white p-5">
        <p className="text-[14px] text-black/80">{post.finalText ?? post.originalText}</p>
      </section>

      {/* 오류가 0건인 것과 분석이 아직 안 끝났거나 실패한 것은 다르다. 뭉뚱그리지 않는다. */}
      {errors && errors.status !== 'SUCCEEDED' && (
        <section className="rounded-[10px] border border-black/10 bg-white p-5">
          <p className="text-[14px] text-black/70">
            {errors.status === 'FAILED'
              ? '분석에 실패했어요. 잠시 후 다시 확인해 주세요.'
              : '분석 중이에요. 잠시 후 다시 확인해 주세요.'}
          </p>
        </section>
      )}

      {errors?.status === 'SUCCEEDED' && errors.errors.length > 0 && (
        <section className="correction-section space-y-2">
          <h2 className="text-[16px] font-semibold text-black">고친 것들</h2>
          <ul className="correction-list space-y-2">
            {errors.errors.map((error) => (
              <li
                key={`${error.errorType}-${error.startIndex}`}
                className="rounded-[10px] border border-black/10 bg-white p-3 text-[14px]"
              >
                {error.originalText} → {error.suggestion}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
