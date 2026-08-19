import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getWritingErrors, getWritings } from '../../lib/api'
import type { WritingStatus } from '../../lib/apiTypes'
import { DEV_CHILD_PROFILE_ID } from '../../lib/devChild'
import { useWritingStore } from '../../stores/writingStore'
import { TOPICS } from '../../lib/topics'

const STATUS_LABELS: Record<WritingStatus, string> = {
  DRAFT: '쓰던 글',
  SUBMITTED: '분석 중',
  ANALYZED: '고칠 것 확인하기',
  CONFIRMED: '수정 완료',
  ANALYSIS_FAILED: '분석 실패',
}

export function ChildHome() {
  const navigate = useNavigate()
  const resetWriting = useWritingStore((s) => s.reset)
  const { data: writings, isLoading } = useQuery({
    queryKey: ['writings', DEV_CHILD_PROFILE_ID, 0, 5],
    queryFn: () => getWritings({ page: 0, size: 5 }),
  })
  const posts = writings?.content

  const latestPostId = posts?.[0]?.writingId
  const { data: latestErrors } = useQuery({
    queryKey: ['writings', latestPostId, 'errors'],
    queryFn: () => getWritingErrors(latestPostId as number),
    enabled: latestPostId !== undefined,
  })
  const latestCorrection = latestErrors?.errors[0]

  function startWriting() {
    resetWriting()
    navigate('/child/write')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">안녕, 오늘도 글을 써볼까?</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-ink/10 bg-white p-6">
            <h2 className="mb-2 font-semibold">오늘의 글쓰기</h2>
            <p className="mb-4 text-body text-ink/70">자유롭게 1~3문장을 써 보세요. 틀려도 괜찮아요!</p>
            <button
              type="button"
              onClick={startWriting}
              className="min-h-touch w-full rounded-xl bg-brand px-6 text-body font-semibold text-white"
            >
              새 글쓰기 시작하기
            </button>
          </section>

          <section className="rounded-xl border border-ink/10 bg-white p-6">
            <h2 className="mb-1 font-semibold">오늘의 추천 주제</h2>
            <p className="mb-3 text-sm text-ink/60">자유 선택</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={startWriting}
                  className="min-h-touch rounded-xl bg-brand-soft px-4 text-body text-brand"
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {latestCorrection && (
            <section className="rounded-xl border border-ink/10 bg-white p-6">
              <h2 className="mb-2 font-semibold">최근 자기교정 성공 🎉</h2>
              <p className="text-sm text-ink/70">
                지난번에 &apos;{latestCorrection.originalText}&apos;을(를) 스스로 &apos;{latestCorrection.suggestion}
                &apos;(으)로 고쳤어요. 정말 잘했어요!
              </p>
            </section>
          )}

          {latestErrors && latestErrors.status !== 'SUCCEEDED' && (
            <section className="rounded-xl border border-ink/10 bg-white p-6">
              <h2 className="mb-2 font-semibold">
                {latestErrors.status === 'FAILED' ? '분석에 실패했어요' : '글을 분석하고 있어요'}
              </h2>
              <p className="text-sm text-ink/70">
                {latestErrors.status === 'FAILED'
                  ? '잠시 후 다시 확인해 주세요.'
                  : '분석이 끝나면 고칠 부분을 확인할 수 있어요.'}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-ink/10 bg-white p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold">이전 글 기록</h2>
              <button type="button" onClick={() => navigate('/child/posts')} className="text-sm text-brand">
                전체 보기
              </button>
            </div>
            <p className="mb-3 text-sm text-ink/60">지난 글을 다시 읽어보고 싶으면 눌러 보세요.</p>
            {isLoading && <p>불러오는 중...</p>}
            <ul className="space-y-2">
              {posts?.map((post) => (
                <li key={post.writingId}>
                  <button
                    type="button"
                    onClick={() => navigate(`/child/posts/${post.writingId}`)}
                    className="min-h-touch w-full rounded-lg border border-ink/10 p-3 text-left"
                  >
                    <p className="text-xs text-ink/60">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')} ·{' '}
                      {STATUS_LABELS[post.status]}
                    </p>
                    <p className="text-body font-semibold">{post.topic}</p>
                    <p className="text-sm text-ink/60">{post.preview}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
