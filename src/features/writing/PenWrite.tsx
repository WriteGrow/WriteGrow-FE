import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { PenCanvas, type Stroke } from '../../lib/pen/PenCanvas'
import { useWritingStore } from '../../stores/writingStore'

export function PenWrite() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const setContent = useWritingStore((s) => s.setContent)
  const [strokes, setStrokes] = useState<Stroke[]>([])

  const ocrMutation = useMutation({
    mutationFn: async (strokeCount: number): Promise<{ text: string }> => {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strokeCount }),
      })
      return res.json()
    },
    onSuccess: ({ text }) => {
      setContent(text)
      navigate('/child/write/ocr')
    },
  })

  if (!topic || mode !== 'pen') {
    return <Navigate to="/child/write" replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{topic}</h1>
      <p className="text-body text-ink/70">펜으로 편하게 써볼까?</p>

      <PenCanvas strokes={strokes} onStrokesChange={setStrokes} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStrokes([])}
          disabled={strokes.length === 0}
          className="min-h-touch flex-1 rounded-xl border border-ink/10 px-6 text-body disabled:opacity-40"
        >
          지우기
        </button>
        <button
          type="button"
          onClick={() => ocrMutation.mutate(strokes.length)}
          disabled={strokes.length === 0 || ocrMutation.isPending}
          className="min-h-touch flex-1 rounded-xl bg-brand px-6 text-body font-semibold text-white disabled:opacity-40"
        >
          {ocrMutation.isPending ? '읽는 중...' : '완료'}
        </button>
      </div>
    </div>
  )
}
