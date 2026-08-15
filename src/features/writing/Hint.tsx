import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWritingStore } from '../../stores/writingStore'

// 오류를 한 번에 하나씩만 보여줘서 R-GLTURC(화면당 교정 대상 최대 2개)를 만족한다.
export function Hint() {
  const navigate = useNavigate()
  const errors = useWritingStore((s) => s.errors)
  const hintIndex = useWritingStore((s) => s.hintIndex)
  const hintLevel = useWritingStore((s) => s.hintLevel)
  const nextError = useWritingStore((s) => s.nextError)
  const bumpHintLevel = useWritingStore((s) => s.bumpHintLevel)

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    setAnswer('')
    setFeedback('idle')
  }, [hintIndex])

  useEffect(() => {
    if (errors.length === 0 || hintIndex >= errors.length) {
      navigate('/child/write/result', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.length, hintIndex])

  const current = errors[hintIndex]
  if (!current) return null

  const revealed = hintLevel >= 2

  function checkAnswer() {
    if (answer.trim() === current.suggestion.trim()) {
      setFeedback('correct')
      return
    }
    setFeedback('wrong')
    bumpHintLevel()
  }

  function goNext() {
    if (hintIndex + 1 >= errors.length) {
      navigate('/child/write/result')
    } else {
      nextError()
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink/60">
        {hintIndex + 1} / {errors.length}
      </p>
      <h1 className="text-2xl font-bold">여기, 다시 한 번 볼까?</h1>

      <p className="rounded-xl bg-white p-4 text-body">
        {current.type} 부분을 확인해봐 — <mark className="bg-brand-soft">{current.original}</mark>
      </p>

      {hintLevel >= 1 && !revealed && (
        <p className="text-body text-ink/70">힌트: '{current.suggestion[0]}'으로 시작해</p>
      )}
      {revealed && <p className="text-body font-semibold text-brand">정답: {current.suggestion}</p>}

      {!revealed && feedback !== 'correct' && (
        <div className="flex gap-3">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-touch flex-1 rounded-xl border border-ink/10 px-4 text-body"
            placeholder="이렇게 고칠래"
          />
          <button
            type="button"
            onClick={checkAnswer}
            disabled={!answer.trim()}
            className="min-h-touch rounded-xl bg-brand px-6 text-body font-semibold text-white disabled:opacity-40"
          >
            확인
          </button>
        </div>
      )}

      {feedback === 'wrong' && !revealed && <p className="text-body text-ink/70">다시 한 번 해볼까?</p>}

      {(feedback === 'correct' || revealed) && (
        <button
          type="button"
          onClick={goNext}
          className="min-h-touch w-full rounded-xl bg-brand px-6 text-body font-semibold text-white"
        >
          다음
        </button>
      )}
    </div>
  )
}
