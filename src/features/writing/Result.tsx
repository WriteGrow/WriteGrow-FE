import { useNavigate } from 'react-router-dom'
import { useWritingStore } from '../../stores/writingStore'

export function Result() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const content = useWritingStore((s) => s.content)
  const errors = useWritingStore((s) => s.errors)
  const reset = useWritingStore((s) => s.reset)

  function goHome() {
    reset()
    navigate('/child')
  }

  function goPosts() {
    reset()
    navigate('/child/posts')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">잘했어! 오늘도 한 편 완성했네</h1>

      <section className="rounded-xl bg-white p-4">
        <h2 className="mb-2 font-semibold">{topic}</h2>
        <p className="text-body text-ink/80">{content}</p>
      </section>

      {errors.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-semibold">이번에 고친 것들</h2>
          <ul className="space-y-2">
            {errors.map((error) => (
              <li key={error.id} className="rounded-lg bg-brand-soft p-3 text-body">
                {error.original} → {error.suggestion}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-body text-ink/70">틀린 곳이 하나도 없었어. 정말 잘 썼어!</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goPosts}
          className="min-h-touch flex-1 rounded-xl border border-brand px-6 text-body font-semibold text-brand"
        >
          이전 글 보기
        </button>
        <button
          type="button"
          onClick={goHome}
          className="min-h-touch flex-1 rounded-xl bg-brand px-6 text-body font-semibold text-white"
        >
          홈으로
        </button>
      </div>
    </div>
  )
}
