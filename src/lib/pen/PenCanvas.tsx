import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getStroke } from 'perfect-freehand'

export type Stroke = number[][] // [x, y, pressure][]

interface Diagnostic {
  pressure: number
  tiltX: number
  tiltY: number
  pointerType: string
}

// perfect-freehand 공식 렌더링 레시피: getStroke가 돌려주는 외곽선 점들을
// 인접 점의 중점을 지나는 2차 베지어 경로로 이어 붙인다.
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return ''
  const d = stroke.reduce(
    (acc: (string | number)[], [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q'],
  )
  d.push('Z')
  return d.join(' ')
}

export function PenCanvas({
  strokes,
  onStrokesChange,
  onLiveStrokeChange,
}: {
  strokes: Stroke[]
  onStrokesChange: (strokes: Stroke[]) => void
  onLiveStrokeChange?: (points: Stroke) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [current, setCurrent] = useState<Stroke>([])
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)

  useEffect(() => {
    onLiveStrokeChange?.(current)
  }, [current, onLiveStrokeChange])

  function toLocal(e: ReactPointerEvent<SVGSVGElement>): [number, number] {
    const rect = svgRef.current!.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    // 팜 리젝션 근사치: 손가락/손바닥은 펜보다 접촉 폭이 훨씬 넓다. 실기기 확인 후 조정 대상.
    if (e.pointerType === 'touch' && e.width > 20) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const [x, y] = toLocal(e)
    setCurrent([[x, y, e.pressure || 0.5]])
    setDiagnostic({ pressure: e.pressure, tiltX: e.tiltX, tiltY: e.tiltY, pointerType: e.pointerType })
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (current.length === 0) return
    const [x, y] = toLocal(e)
    setCurrent((prev) => [...prev, [x, y, e.pressure || 0.5]])
    setDiagnostic({ pressure: e.pressure, tiltX: e.tiltX, tiltY: e.tiltY, pointerType: e.pointerType })
  }

  function handlePointerUp() {
    if (current.length === 0) return
    onStrokesChange([...strokes, current])
    setCurrent([])
  }

  const visibleStrokes = current.length ? [...strokes, current] : strokes

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <svg
        ref={svgRef}
        className="min-h-0 w-full flex-1 touch-none rounded-xl border border-ink/10 bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {visibleStrokes.map((stroke, i) => (
          <path key={i} d={getSvgPathFromStroke(getStroke(stroke, { size: 6 }))} fill="var(--color-ink)" />
        ))}
      </svg>
      {import.meta.env.DEV && diagnostic && (
        <p className="shrink-0 text-sm text-ink/60">
          압력 {diagnostic.pressure.toFixed(2)} · 기울기 ({diagnostic.tiltX}, {diagnostic.tiltY}) ·{' '}
          {diagnostic.pointerType}
        </p>
      )}
    </div>
  )
}
