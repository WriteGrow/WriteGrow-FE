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
  const [livePoints, setLivePoints] = useState<Stroke>([])

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

  const totalPoints = strokes.reduce((sum, s) => sum + s.length, 0) + livePoints.length

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold">{topic}</h1>
        <p className="text-body text-ink/70">펜으로 편하게 써볼까?</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1">
            <PenCanvas strokes={strokes} onStrokesChange={setStrokes} onLiveStrokeChange={setLivePoints} />
          </div>

          <div className="flex shrink-0 gap-3">
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

        {import.meta.env.DEV && (
          <aside className="flex min-h-0 w-full flex-1 flex-col rounded-xl border border-ink/10 bg-white p-4 lg:w-72 lg:flex-none">
            <h2 className="shrink-0 font-semibold">펜 좌표 데이터 (개발용)</h2>
            <p className="mb-2 shrink-0 text-xs text-ink/60">
              완성된 획 {strokes.length}개 · 총 {totalPoints}점 (지우기 전까지 계속 기록됨)
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg bg-ink/5 p-2 font-mono text-xs">
              {strokes.length === 0 && livePoints.length === 0 && (
                <p className="text-ink/40">펜을 움직이면 좌표가 표시돼요.</p>
              )}
              {strokes.map((stroke, strokeIdx) => (
                <details key={strokeIdx} className="mb-1 rounded border border-ink/10">
                  <summary className="cursor-pointer select-none px-2 py-1 text-ink/60">
                    획 {strokeIdx + 1} ({stroke.length}점)
                  </summary>
                  <div className="border-t border-ink/10 px-2 py-1">
                    {stroke.map(([x, y, pressure], i) => (
                      <div key={i}>
                        x:{x.toFixed(1)} y:{y.toFixed(1)} p:{pressure.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
              {livePoints.length > 0 && (
                <div>
                  <p className="text-ink/50">진행 중인 획 ({livePoints.length}점)</p>
                  {livePoints.map(([x, y, pressure], i) => (
                    <div key={i}>
                      x:{x.toFixed(1)} y:{y.toFixed(1)} p:{pressure.toFixed(2)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
