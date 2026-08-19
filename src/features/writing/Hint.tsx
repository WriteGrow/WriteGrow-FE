import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWritingStore } from '../../stores/writingStore'

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
    if (errors.length === 0 || hintIndex >= errors.length) {
      navigate('/child/write/result', { replace: true })
    }
  }, [errors.length, hintIndex, navigate])

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
      return
    }
    setAnswer('')
    setFeedback('idle')
    nextError()
  }

  return (
    <div className="space-y-6">
      <p className="text-[12px] text-black/50">
        {hintIndex + 1} / {errors.length}
      </p>
      <h1 className="text-[16px] font-semibold text-black">어디가 틀렸는지 다시 찾아볼까?</h1>

      <p className="rounded-[10px] border border-black/10 bg-white p-4 text-[14px] text-black">
        {current.errorTypeLabel} 부분을 확인해봐 — <mark className="bg-black/10">{current.originalText}</mark>
      </p>

      {hintLevel >= 1 && !revealed && (
        <p className="text-[14px] text-black/70">
          힌트: {current.reason ?? `'${current.suggestion[0]}'으로 시작해`}
        </p>
      )}
      {revealed && <p className="text-[14px] font-semibold text-black">정답: {current.suggestion}</p>}

      {!revealed && feedback !== 'correct' && (
        <div className="flex gap-3">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="flex-1 rounded-[5px] border border-black/15 px-4 py-2.5 text-[14px] outline-none focus:border-black"
            placeholder="어떻게 고치면 좋을까?"
          />
          <button
            type="button"
            onClick={checkAnswer}
            disabled={!answer.trim()}
            className="rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
          >
            확인
          </button>
        </div>
      )}

      {feedback === 'wrong' && !revealed && <p className="text-[14px] text-black/70">다시 한 번 생각해볼까?</p>}

      {(feedback === 'correct' || revealed) && (
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90"
        >
          다음
        </button>
      )}
    </div>
  )
}
