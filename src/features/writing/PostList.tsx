import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getWritings } from '../../lib/api'
import type { WritingStatus } from '../../lib/apiTypes'
import { useAccountStore } from '../../stores/accountStore'

// 서버는 글별 오류 개수를 주지 않는다. 개수 대신 글 상태로 라벨을 만든다.
const STATUS_LABELS: Record<WritingStatus, string> = {
  DRAFT: '쓰던 글',
  SUBMITTED: '분석 중',
  ANALYZED: '고칠 것 확인하기',
  CONFIRMED: '수정 완료',
  ANALYSIS_FAILED: '분석 실패',
}

export function PostList() {
  const navigate = useNavigate()
  const activeChildProfileId = useAccountStore((s) => s.activeChildProfileId)
  const { data: writings, isLoading } = useQuery({
    queryKey: ['writings', activeChildProfileId, 0, 20],
    queryFn: () => getWritings({ page: 0, size: 20 }),
    enabled: activeChildProfileId !== null,
  })
  const posts = writings?.content

  return (
    <div className="space-y-4">
      <h1 className="text-[16px] font-semibold text-black">이전 글</h1>
      {isLoading && <p className="text-[12px] text-black/50">불러오는 중...</p>}
      <ul className="child-post-list space-y-2">
        {posts?.map((post) => (
          <li key={post.writingId}>
            <button
              type="button"
              onClick={() => navigate(`/child/posts/${post.writingId}`)}
              className="w-full rounded-[10px] border border-black/10 bg-white p-4 text-left"
            >
              <p className="text-[14px] font-semibold text-black">{post.topic}</p>
              <p className="text-[12px] text-black/70">{post.preview}</p>
              <p className="text-[12px] text-black/50">
                {new Date(post.createdAt).toLocaleDateString('ko-KR')} · {STATUS_LABELS[post.status]}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
