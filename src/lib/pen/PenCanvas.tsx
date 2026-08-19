import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getStroke } from 'perfect-freehand'

export type Stroke = number[][] // [x, y, pressure][]
export type PenTool = 'pen' | 'eraser'

interface Diagnostic {
  pressure: number
  tiltX: number
  tiltY: number
  pointerType: string
}

const ERASE_RADIUS = 14

function isStrokeNear(stroke: Stroke, x: number, y: number, radius: number): boolean {
  return stroke.some(([px, py]) => Math.hypot(px - x, py - y) <= radius)
}

// lucide "pencil" 아이콘을 그대로 커서로 사용 — 필기 팁(좌하단)이 실제 포인터 위치에 오도록 핫스팟을 잡는다.
const PEN_CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`
const PEN_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(PEN_CURSOR_SVG)}") 2 22, crosshair`

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
  tool = 'pen',
  stylusOnly = true,
}: {
  strokes: Stroke[]
  onStrokesChange: (strokes: Stroke[]) => void
  onLiveStrokeChange?: (points: Stroke) => void
  tool?: PenTool
  stylusOnly?: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [current, setCurrent] = useState<Stroke>([])
  const [erasing, setErasing] = useState(false)
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)

  useEffect(() => {
    onLiveStrokeChange?.(current)
  }, [current, onLiveStrokeChange])

  function toLocal(e: ReactPointerEvent<SVGSVGElement>): [number, number] {
    const rect = svgRef.current!.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  function eraseAt(x: number, y: number) {
    const remaining = strokes.filter((stroke) => !isStrokeNear(stroke, x, y, ERASE_RADIUS))
    if (remaining.length !== strokes.length) {
      onStrokesChange(remaining)
    }
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    // 스타일러스 전용 모드일 때만 거른다. 갤럭시탭 실기기 테스트 결과 폭 기반 팜 리젝션(width>20)은
    // 손가락 입력을 걸러내지 못했다 — S펜/애플펜슬은 pointerType이 'pen'으로 들어오므로
    // 폭과 무관하게 'touch'(손가락)인지만 본다.
    if (stylusOnly && e.pointerType === 'touch') return
    e.currentTarget.setPointerCapture(e.pointerId)
    const [x, y] = toLocal(e)
    setDiagnostic({ pressure: e.pressure, tiltX: e.tiltX, tiltY: e.tiltY, pointerType: e.pointerType })

    if (tool === 'eraser') {
      setErasing(true)
      eraseAt(x, y)
      return
    }
    setCurrent([[x, y, e.pressure || 0.5]])
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const [x, y] = toLocal(e)
    setDiagnostic({ pressure: e.pressure, tiltX: e.tiltX, tiltY: e.tiltY, pointerType: e.pointerType })

    if (tool === 'eraser') {
      if (erasing) eraseAt(x, y)
      return
    }
    if (current.length === 0) return
    setCurrent((prev) => [...prev, [x, y, e.pressure || 0.5]])
  }

  function handlePointerUp() {
    if (tool === 'eraser') {
      setErasing(false)
      return
    }
    if (current.length === 0) return
    onStrokesChange([...strokes, current])
    setCurrent([])
  }

  const visibleStrokes = current.length ? [...strokes, current] : strokes

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <svg
        ref={svgRef}
        className="min-h-0 w-full flex-1 touch-none rounded-[10px] border border-black/10 bg-white"
        style={{ cursor: tool === 'eraser' ? 'cell' : PEN_CURSOR }}
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
