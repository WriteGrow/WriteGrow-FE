import { getStroke } from 'perfect-freehand'
import type { CanvasSize, Stroke } from './PenCanvas'

function toRenderPoints(stroke: Stroke): number[][] {
  return stroke.points.map(({ x, y, pressure }) => [x, y, pressure ?? 0.5])
}

export function rasterizeStrokes(strokes: Stroke[], size: CanvasSize): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(size.canvasWidth))
  canvas.height = Math.max(1, Math.round(size.canvasHeight))
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('손글씨 이미지를 만들 수 없어요.'))

  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#1a1a1a'
  for (const stroke of strokes) {
    const outline = getStroke(toRenderPoints(stroke), { size: 6 })
    if (outline.length === 0) continue
    context.beginPath()
    outline.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.closePath()
    context.fill()
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('손글씨 PNG를 만들 수 없어요.'))
    }, 'image/png')
  })
}
