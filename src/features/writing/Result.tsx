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
      <h1 className="text-[16px] font-semibold text-black">잘했어! 오늘 글쓰기를 완성했네</h1>

      <section className="rounded-[10px] border border-black/10 bg-white p-5">
        <h2 className="mb-2 text-[16px] font-semibold text-black">{topic}</h2>
        <p className="text-[14px] text-black/80">{content}</p>
      </section>

      {errors.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-black">이번에 고친 것들</h2>
          <ul className="space-y-2">
            {errors.map((error) => (
              <li
                key={`${error.errorType}-${error.startIndex}`}
                className="rounded-[10px] border border-black/10 bg-white p-3 text-[14px]"
              >
                {error.originalText} → {error.suggestion}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-[14px] text-black/70">고칠 것이 하나도 없었어. 정말 잘 썼어!</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goPosts}
          className="flex-1 rounded-[5px] border border-black/20 px-4 py-2.5 text-[14px] font-semibold text-black hover:bg-black/5"
        >
          이전 글 보기
        </button>
        <button
          type="button"
          onClick={goHome}
          className="flex-1 rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90"
        >
          홈으로
        </button>
      </div>
    </div>
  )
}
