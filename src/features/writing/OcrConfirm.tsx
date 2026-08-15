import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useWritingStore } from '../../stores/writingStore'

export function OcrConfirm() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const storedContent = useWritingStore((s) => s.content)
  const setContent = useWritingStore((s) => s.setContent)
  const [text, setText] = useState(storedContent)

  function confirm() {
    setContent(text.trim())
    navigate('/child/write/analyzing')
  }

  if (!topic || mode !== 'pen' || !storedContent) {
    return <Navigate to="/child/write" replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">이렇게 읽었어, 맞아?</h1>
      <p className="text-body text-ink/70">잘못 읽은 부분이 있으면 고쳐줘.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full rounded-xl border border-ink/10 p-4 text-body"
      />

      <button
        type="button"
        onClick={confirm}
        disabled={!text.trim()}
        className="min-h-touch w-full rounded-xl bg-brand px-6 text-body font-semibold text-white disabled:opacity-40"
      >
        맞아, 다음으로
      </button>
    </div>
  )
}
