import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getWritings } from '../../lib/api'
import type { WritingStatus } from '../../lib/apiTypes'
import { DEV_CHILD_PROFILE_ID } from '../../lib/devChild'

const STATUS_LABELS: Record<WritingStatus, string> = {
  DRAFT: '쓰던 글',
  SUBMITTED: '분석 중',
  ANALYZED: '고칠 것 확인하기',
  CONFIRMED: '수정 완료',
  ANALYSIS_FAILED: '분석 실패',
}

export function PostList() {
  const navigate = useNavigate()
  const { data: writings, isLoading } = useQuery({
    queryKey: ['writings', DEV_CHILD_PROFILE_ID, 0, 20],
    queryFn: () => getWritings({ page: 0, size: 20 }),
  })
  const posts = writings?.content

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">이전 글</h1>
      {isLoading && <p className="text-body">불러오는 중...</p>}
      <ul className="space-y-2">
        {posts?.map((post) => (
          <li key={post.writingId}>
            <button
              type="button"
              onClick={() => navigate(`/child/posts/${post.writingId}`)}
              className="min-h-touch w-full rounded-lg bg-white p-4 text-left shadow-sm"
            >
              <p className="text-body font-semibold">{post.topic}</p>
              <p className="text-sm text-ink/70">{post.preview}</p>
              <p className="text-sm text-ink/60">
                {new Date(post.createdAt).toLocaleDateString('ko-KR')} · {STATUS_LABELS[post.status]}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
