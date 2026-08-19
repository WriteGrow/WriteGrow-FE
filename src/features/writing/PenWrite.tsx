import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { Redo2, Undo2 } from 'lucide-react'
import {
  PenCanvas,
  type CanvasSize,
  type PenTool,
  type Stroke,
} from '../../lib/pen/PenCanvas'
import { rasterizeStrokes } from '../../lib/pen/rasterize'
import { appendStrokes, createWriting, submitWriting, uploadHandwritingImage } from '../../lib/api'
import type { StrokeData } from '../../lib/apiTypes'
import { useWritingStore } from '../../stores/writingStore'

export function PenWrite() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const writingId = useWritingStore((s) => s.writingId)
  const setWritingId = useWritingStore((s) => s.setWritingId)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [history, setHistory] = useState<Stroke[][]>([])
  const [future, setFuture] = useState<Stroke[][]>([])
  const [liveStroke, setLiveStroke] = useState<Stroke | null>(null)
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null)
  const [tool, setTool] = useState<PenTool>('pen')
  const [stylusOnly, setStylusOnly] = useState(true)

  // 그리기·지우개 모두 이 경로로 strokes를 바꿔서, 배열 스냅샷 하나 = 되돌리기 한 단계가 되게 한다.
  function commitStrokes(next: Stroke[]) {
    setHistory((h) => [...h, strokes])
    setStrokes(next)
    setFuture([])
  }

  function undo() {
    if (history.length === 0) return
    const previous = history[history.length - 1]
    setFuture((f) => [strokes, ...f])
    setHistory((h) => h.slice(0, -1))
    setStrokes(previous)
  }

  function redo() {
    if (future.length === 0) return
    const [next, ...rest] = future
    setHistory((h) => [...h, strokes])
    setFuture(rest)
    setStrokes(next)
  }

  function clearAll() {
    setStrokes([])
    setHistory([])
    setFuture([])
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!topic || strokes.length === 0 || !canvasSize) {
        throw new Error('손글씨를 보낼 준비가 되지 않았어요.')
      }

      const id = writingId ?? (await createWriting({ inputType: 'PEN', topic })).writingId
      setWritingId(id)
      const strokeData: StrokeData[] = strokes.map((stroke, index) => ({ ...stroke, index }))
      await appendStrokes(id, { batchSeq: 0, strokes: strokeData })
      const image = await rasterizeStrokes(strokes, canvasSize)
      await uploadHandwritingImage(id, image, canvasSize)
      await submitWriting(id)
      return id
    },
    onSuccess: () => navigate('/child/write/ocr'),
  })

  if (!topic || mode !== 'pen') {
    return <Navigate to="/child/write" replace />
  }

  const totalPoints = strokes.reduce((sum, s) => sum + s.points.length, 0) + (liveStroke?.points.length ?? 0)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-[16px] font-semibold text-black">{topic}</h1>
        <p className="text-[14px] text-black/70">펜으로 편하게 써볼까?</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap shrink-0 items-center gap-2">
            <div className="flex shrink-0 gap-1 rounded-[5px] border border-black/15 p-1">
              <button
                type="button"
                onClick={() => setTool('pen')}
                className={`shrink-0 whitespace-nowrap rounded-[5px] px-4 py-2 text-[12px] ${
                  tool === 'pen' ? 'bg-black text-white' : 'text-black/70'
                }`}
              >
                펜
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`shrink-0 whitespace-nowrap rounded-[5px] px-4 py-2 text-[12px] ${
                  tool === 'eraser' ? 'bg-black text-white' : 'text-black/70'
                }`}
              >
                지우개
              </button>
            </div>
            <div className="flex shrink-0 gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={undo}
                disabled={history.length === 0}
                aria-label="되돌리기"
                title="되돌리기"
                className="flex size-9 shrink-0 items-center justify-center rounded-[5px] border border-black/15 disabled:opacity-40"
              >
                <Undo2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={future.length === 0}
                aria-label="다시하기"
                title="다시하기"
                className="flex size-9 shrink-0 items-center justify-center rounded-[5px] border border-black/15 disabled:opacity-40"
              >
                <Redo2 className="size-4" />
              </button>
            </div>
          </div>

          <label className="flex shrink-0 items-center gap-2 text-[12px] text-black/70">
            <button
              type="button"
              role="switch"
              aria-checked={stylusOnly}
              onClick={() => setStylusOnly((v) => !v)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                stylusOnly ? 'bg-black' : 'bg-ink/20'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform ${
                  stylusOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            스타일러스 전용 (손가락 입력 무시)
          </label>

          <div className="min-h-0 flex-1">
            <PenCanvas
              strokes={strokes}
              onStrokesChange={commitStrokes}
              onLiveStrokeChange={setLiveStroke}
              onCanvasSizeChange={setCanvasSize}
              tool={tool}
              stylusOnly={stylusOnly}
            />
          </div>

          {submitMutation.isError && (
            <p role="alert" className="text-[14px] text-red-700">
              {submitMutation.error instanceof Error ? submitMutation.error.message : '글을 보내지 못했어요.'}
            </p>
          )}

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={clearAll}
              disabled={strokes.length === 0}
              className="flex-1 rounded-[5px] border border-black/15 px-4 py-2.5 text-[14px] disabled:opacity-40"
            >
              전체 지우기
            </button>
            <button
              type="button"
              onClick={() => submitMutation.mutate()}
              disabled={strokes.length === 0 || canvasSize === null || submitMutation.isPending}
              className="flex-1 rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            >
              {submitMutation.isPending ? '읽는 중...' : '완료'}
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
              {strokes.length === 0 && liveStroke === null && (
                <p className="text-ink/40">펜을 움직이면 좌표가 표시돼요.</p>
              )}
              {strokes.map((stroke, strokeIdx) => (
                <details key={strokeIdx} className="mb-1 rounded border border-ink/10">
                  <summary className="cursor-pointer select-none px-2 py-1 text-ink/60">
                    획 {strokeIdx + 1} ({stroke.points.length}점)
                  </summary>
                  <div className="border-t border-ink/10 px-2 py-1">
                    {stroke.points.map(({ x, y, pressure }, i) => (
                      <div key={i}>
                        x:{x.toFixed(1)} y:{y.toFixed(1)} p:{pressure === null ? '미지원' : pressure.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
              {liveStroke && liveStroke.points.length > 0 && (
                <div>
                  <p className="text-ink/50">진행 중인 획 ({liveStroke.points.length}점)</p>
                  {liveStroke.points.map(({ x, y, pressure }, i) => (
                    <div key={i}>
                      x:{x.toFixed(1)} y:{y.toFixed(1)} p:{pressure === null ? '미지원' : pressure.toFixed(2)}
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
