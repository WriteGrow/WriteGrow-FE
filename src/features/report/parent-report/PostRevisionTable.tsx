import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getChildWritings } from '../../../lib/api'
import type { WritingStatus, WritingSummaryResponse } from '../../../lib/apiTypes'

const STATUS_LABELS: Record<WritingStatus, string> = {
  DRAFT: '작성 중',
  SUBMITTED: '제출됨',
  ANALYZED: '분석 완료',
  CONFIRMED: '확정',
  ANALYSIS_FAILED: '분석 실패',
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  return value.slice(0, 10)
}

function WritingRows({
  childProfileId,
  writings,
}: {
  childProfileId: number
  writings: WritingSummaryResponse[]
}) {
  if (writings.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-6 text-center text-black/45">
          이번 주에 열람할 글이 아직 없어요.
        </td>
      </tr>
    )
  }

  return (
    <>
      {writings.map((writing) => (
        <tr key={writing.writingId} className="border-b border-black/10 last:border-b-0">
          <td className="px-4 py-2">{formatDate(writing.submittedAt ?? writing.createdAt)}</td>
          <td className="px-4 py-2">
            <Link
              to={`/parent/children/${childProfileId}/posts/${writing.writingId}`}
              className="hover:underline"
            >
              {writing.topic || writing.preview || `글 ${writing.writingId}`}
            </Link>
          </td>
          <td className="px-4 py-2">{writing.preview || '-'}</td>
          <td className="px-4 py-2">{STATUS_LABELS[writing.status] ?? writing.status}</td>
        </tr>
      ))}
    </>
  )
}

export function PostRevisionTable({ childProfileId }: { childProfileId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', childProfileId, 'writings', { page: 0, size: 10 }],
    queryFn: () => getChildWritings(childProfileId, { page: 0, size: 10 }),
  })

  const writings = data?.content ?? []

  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">개별 글 수정 전후 열람</h2>
      <div className="overflow-x-auto rounded-[10px] border border-black/10 bg-white p-5">
        {isLoading && <p className="text-[12px] text-black/50">글 목록을 불러오는 중...</p>}
        {isError && <p className="text-[12px] text-red-700">글 목록을 불러오지 못했어요.</p>}
        {!isLoading && !isError && (
          <>
            <div className="overflow-hidden rounded-[10px] border border-black/10">
              <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-black/10 bg-[#f3f4f6] text-black/50">
                    <th className="px-4 py-2.5 font-medium">작성일</th>
                    <th className="px-4 py-2.5 font-medium">글 제목</th>
                    <th className="px-4 py-2.5 font-medium">미리보기</th>
                    <th className="px-4 py-2.5 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  <WritingRows childProfileId={childProfileId} writings={writings} />
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end">
              {writings[0] ? (
                <Link
                  to={`/parent/children/${childProfileId}/posts/${writings[0].writingId}`}
                  className="cursor-pointer text-[12px] text-black/50 hover:text-black"
                >
                  수정 전후 열람
                </Link>
              ) : (
                <span className="text-[12px] text-black/35">수정 전후 열람</span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
