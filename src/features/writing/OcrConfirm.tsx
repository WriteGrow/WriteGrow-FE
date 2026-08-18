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
      <h1 className="text-[16px] font-semibold text-black">이렇게 읽었어, 맞아?</h1>
      <p className="text-[14px] text-black/70">잘못 읽은 부분이 있으면 고쳐줘.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full rounded-[5px] border border-black/15 p-4 text-[14px] outline-none focus:border-black"
      />

      <button
        type="button"
        onClick={confirm}
        disabled={!text.trim()}
        className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
      >
        맞아, 다음으로
      </button>
    </div>
  )
}
