import type { ParentWritingDetailResponse, WritingInputType } from '../../../lib/apiTypes'

const INPUT_TYPE_LABELS: Record<WritingInputType, string> = {
  KEYBOARD: '키보드',
  PEN: '펜',
}

function formatWrittenAt(value: string | null | undefined) {
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

export function PostMetaCard({ writing }: { writing: ParentWritingDetailResponse }) {
  return (
    <section className="space-y-4">
      <h1 className="text-[16px] font-semibold text-black">글 수정 전후 열람</h1>
      <div className="grid gap-4 rounded-[10px] border border-black/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[12px] text-black/50">작성자</p>
          <p className="mt-1 text-[14px] font-medium text-black">{writing.nickname}</p>
        </div>
        <div>
          <p className="text-[12px] text-black/50">작성일</p>
          <p className="mt-1 text-[14px] font-medium text-black">
            {formatWrittenAt(writing.submittedAt ?? writing.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-black/50">글 제목</p>
          <p className="mt-1 text-[14px] font-medium text-black">{writing.topic || '-'}</p>
        </div>
        <div>
          <p className="text-[12px] text-black/50">입력 방식</p>
          <p className="mt-1 text-[14px] font-medium text-black">
            {INPUT_TYPE_LABELS[writing.inputType] ?? writing.inputType}
          </p>
        </div>
      </div>
    </section>
  )
}
