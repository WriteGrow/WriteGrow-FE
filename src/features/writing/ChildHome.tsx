import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { DEV_CHILD_ID } from '../../lib/devChild'
import { useWritingStore } from '../../stores/writingStore'
import { TOPICS } from '../../mocks/seed'
import type { ErrorItem, Post } from '../../mocks/seed'

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

  const latestPostId = posts?.[0]?.id
  const { data: latestErrors } = useQuery({
    queryKey: ['posts', latestPostId, 'errors'],
    queryFn: async (): Promise<ErrorItem[]> => {
      const res = await fetch(`/api/posts/${latestPostId}/errors`)
      return res.json()
    },
    enabled: !!latestPostId,
  })
  const latestCorrection = latestErrors?.find((e) => e.confirmed)

  function startWriting() {
    resetWriting()
    navigate('/child/write')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[16px] font-semibold text-black">안녕, 오늘도 글을 써볼까?</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="mb-2 text-[16px] font-semibold text-black">오늘의 글쓰기</h2>
            <p className="mb-4 text-body text-ink/70">자유롭게 1~3문장을 써 보세요. 틀려도 괜찮아요!</p>
            <button
              type="button"
              onClick={startWriting}
              className="min-h-touch w-full rounded-xl bg-black px-6 text-body font-semibold text-white hover:bg-black/90"
            >
              새 글쓰기 시작하기
            </button>
          </section>

          <section className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="mb-1 text-[16px] font-semibold text-black">오늘의 추천 주제</h2>
            <p className="mb-3 text-sm text-ink/60">자유 선택</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={startWriting}
                  className="min-h-touch rounded-xl border border-black/15 px-4 text-body text-black/70 hover:bg-black/5"
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {latestCorrection && (
            <section className="rounded-xl border border-black/10 bg-white p-6">
              <h2 className="mb-2 text-[16px] font-semibold text-black">최근 자기교정 성공 🎉</h2>
              <p className="text-sm text-ink/70">
                지난번에 &apos;{latestCorrection.original}&apos;을(를) 스스로 &apos;{latestCorrection.suggestion}
                &apos;(으)로 고쳤어요. 정말 잘했어요!
              </p>
            </section>
          )}

          <section className="rounded-xl border border-black/10 bg-white p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-black">이전 글 기록</h2>
              <button
                type="button"
                onClick={() => navigate('/child/posts')}
                className="text-[14px] text-black/50 hover:text-black"
              >
                전체 보기
              </button>
            </div>
            <p className="mb-3 text-sm text-ink/60">지난 글을 다시 읽어보고 싶으면 눌러 보세요.</p>
            {isLoading && <p>불러오는 중...</p>}
            <ul className="space-y-2">
              {posts?.slice(0, 5).map((post) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/child/posts/${post.id}`)}
                    className="min-h-touch w-full rounded-lg border border-ink/10 p-3 text-left"
                  >
                    <p className="text-xs text-ink/60">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')} ·{' '}
                      {post.errorCount > 0 ? '자기교정 성공' : '수정 완료'}
                    </p>
                    <p className="text-body font-semibold">{post.title}</p>
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
