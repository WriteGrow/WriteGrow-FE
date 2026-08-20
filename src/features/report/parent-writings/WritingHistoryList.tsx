import { Link } from 'react-router-dom'
import type { WritingStatus, WritingSummaryResponse } from '../../../lib/apiTypes'

const STATUS_LABELS: Record<WritingStatus, string> = {
  DRAFT: '작성 중',
  SUBMITTED: '제출됨',
  ANALYZED: '분석 완료',
  CONFIRMED: '확정',
  ANALYSIS_FAILED: '분석 실패',
}

const INPUT_TYPE_LABELS = {
  KEYBOARD: '키보드',
  PEN: '펜',
} as const

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function WritingHistoryList({
  childProfileId,
  writings,
}: {
  childProfileId: number
  writings: WritingSummaryResponse[]
}) {
  if (writings.length === 0) {
    return (
      <div className="rounded-[10px] border border-black/10 bg-white px-5 py-10 text-center text-[14px] text-black/45">
        아직 작성한 글이 없어요.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {writings.map((writing) => (
        <li key={writing.writingId}>
          <Link
            to={`/parent/children/${childProfileId}/posts/${writing.writingId}`}
            className="block rounded-[10px] border border-black/10 bg-white p-5 transition-colors hover:bg-black/[0.02]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-black">
                  {writing.topic || `글 ${writing.writingId}`}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-black/70">
                  {writing.preview || '미리보기가 없어요.'}
                </p>
              </div>
              <span className="shrink-0 rounded-[5px] border border-black/10 px-2.5 py-1 text-[11px] text-black/60">
                {STATUS_LABELS[writing.status] ?? writing.status}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-black/45">
              {formatDate(writing.submittedAt ?? writing.createdAt)}
              <span className="mx-1.5 text-black/25">·</span>
              {INPUT_TYPE_LABELS[writing.inputType] ?? writing.inputType}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
