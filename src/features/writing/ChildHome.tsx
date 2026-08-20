import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bus, Gamepad2, GraduationCap, MapPinned, PawPrint, Sparkles, UsersRound } from 'lucide-react'
import { getWritingErrors, getWritings } from '../../lib/api'
import type { WritingStatus } from '../../lib/apiTypes'
import { useAccountStore } from '../../stores/accountStore'
import { useWritingStore } from '../../stores/writingStore'
import { TOPICS } from '../../lib/topics'

// 서버는 글별 오류 개수를 주지 않는다. 개수 대신 글 상태로 라벨을 만든다.
const STATUS_LABELS: Record<WritingStatus, string> = {
  DRAFT: '쓰던 글',
  SUBMITTED: '분석 중',
  ANALYZED: '고칠 것 확인하기',
  CONFIRMED: '수정 완료',
  ANALYSIS_FAILED: '분석 실패',
}

const TOPIC_CARDS = [
  { topic: TOPICS[0], label: '학교', Icon: GraduationCap, color: 'sky' },
  { topic: TOPICS[1], label: '가족', Icon: UsersRound, color: 'violet' },
  { topic: TOPICS[2], label: '동물', Icon: PawPrint, color: 'mint' },
  { topic: TOPICS[3], label: '여행', Icon: MapPinned, color: 'coral' },
  { topic: TOPICS[4], label: '놀이', Icon: Gamepad2, color: 'yellow' },
] as const

export function ChildHome() {
  const navigate = useNavigate()
  const resetWriting = useWritingStore((s) => s.reset)
  const activeChildProfileId = useAccountStore((s) => s.activeChildProfileId)
  const { data: writings, isLoading } = useQuery({
    queryKey: ['writings', activeChildProfileId, 0, 5],
    queryFn: () => getWritings({ page: 0, size: 5 }),
    enabled: activeChildProfileId !== null,
  })
  const posts = writings?.content

  const latestPostId = posts?.[0]?.writingId
  const { data: latestErrors } = useQuery({
    queryKey: ['writings', latestPostId, 'errors'],
    queryFn: () => getWritingErrors(latestPostId as number),
    enabled: latestPostId !== undefined,
  })
  // errors 는 교정 대상으로 확정된 오류, 즉 "아직 틀린 것"이다. 아이가 스스로 고쳤는지는
  // 현재 API 로 알 수 없다(revisions 는 본문 스냅샷이라 무엇을 고쳤는지 나오지 않는다).
  // 그래서 자기교정 성공을 칭찬하지 않고 다음에 고칠 것을 안내한다.
  const latestErrorToFix = latestErrors?.errors[0]

  function startWriting() {
    resetWriting()
    navigate('/child/write')
  }

  return (
    <div className="child-home space-y-6">
      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="welcome-kicker">오늘도 반가워!</span>
          <h1>상상 톡톡, 글쓰기 시작!</h1>
          <p>네 이야기를 들려줘. 틀려도 괜찮아!</p>
        </div>
        <img src="/writegrow-buddies-flat.png" alt="연필과 책을 든 WriteGrow 글쓰기 친구들" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-[10px] border border-black/10 bg-white p-5">
            <h2 className="mb-2 text-[16px] font-semibold text-black">오늘의 글쓰기</h2>
            <p className="mb-4 text-[14px] text-black/70">자유롭게 1~3문장을 써 보세요. 틀려도 괜찮아요!</p>
            <button
              type="button"
              onClick={startWriting}
              className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90"
            >
              새 글쓰기 시작하기
            </button>
          </section>

          <section className="rounded-[10px] border border-black/10 bg-white p-5">
            <h2 className="mb-1 text-[16px] font-semibold text-black">오늘의 추천 주제</h2>
            <p className="mb-3 text-[12px] text-black/50">자유 선택</p>
            <div className="topic-card-grid">
              {TOPIC_CARDS.map(({ topic, label, Icon, color }, index) => (
                <button
                  key={topic}
                  type="button"
                  onClick={startWriting}
                  className={`topic-card topic-card--${color}`}
                >
                  <span className="topic-card-label">{label}</span>
                  <span className="topic-card-check" aria-hidden>✓</span>
                  <Icon className="topic-card-icon" aria-hidden />
                  <span className="topic-card-title">{topic}</span>
                  {index === 0 && <Bus className="topic-card-doodle" aria-hidden />}
                  {index === 4 && <Sparkles className="topic-card-doodle" aria-hidden />}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {latestErrorToFix && (
            <section className="rounded-[10px] border border-black/10 bg-white p-5">
              <h2 className="mb-2 text-[16px] font-semibold text-black">이번에 고쳐볼 것 ✏️</h2>
              <p className="text-[12px] text-black/70">
                지난 글에서 &apos;{latestErrorToFix.originalText}&apos;을(를) &apos;{latestErrorToFix.suggestion}
                &apos;(으)로 고쳐보면 어때요?
              </p>
            </section>
          )}

          {latestErrors && latestErrors.status !== 'SUCCEEDED' && (
            <section className="rounded-[10px] border border-black/10 bg-white p-5">
              <h2 className="mb-2 text-[16px] font-semibold text-black">
                {latestErrors.status === 'FAILED' ? '분석에 실패했어요' : '글을 분석하고 있어요'}
              </h2>
              <p className="text-[12px] text-black/70">
                {latestErrors.status === 'FAILED'
                  ? '잠시 후 다시 확인해 주세요.'
                  : '분석이 끝나면 고칠 부분을 확인할 수 있어요.'}
              </p>
            </section>
          )}

          <section className="rounded-[10px] border border-black/10 bg-white p-5">
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
            <p className="mb-3 text-[12px] text-black/50">지난 글을 다시 읽어보고 싶으면 눌러 보세요.</p>
            {isLoading && <p className="text-[12px] text-black/50">불러오는 중...</p>}
            <ul className="previous-post-list space-y-2">
              {posts?.map((post) => (
                <li key={post.writingId}>
                  <button
                    type="button"
                    onClick={() => navigate(`/child/posts/${post.writingId}`)}
                    className="w-full rounded-[10px] border border-black/10 p-3 text-left"
                  >
                    <p className="text-[12px] text-black/50">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')} ·{' '}
                      {STATUS_LABELS[post.status]}
                    </p>
                    <p className="text-[14px] font-semibold text-black">{post.topic}</p>
                    <p className="text-[12px] text-black/70">{post.preview}</p>
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
