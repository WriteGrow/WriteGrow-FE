import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getChildWriting } from '../../lib/api'
import { PostChangeSummary } from './parent-post/PostChangeSummary'
import { PostCompareSection } from './parent-post/PostCompareSection'
import { PostMetaCard } from './parent-post/PostMetaCard'

export function ParentPost() {
  const { childId = '', postId = '' } = useParams()
  const childProfileId = Number(childId)
  const writingId = Number(postId)
  const idsValid = Number.isFinite(childProfileId) && Number.isFinite(writingId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', childProfileId, 'writings', writingId],
    enabled: idsValid,
    queryFn: () => getChildWriting(childProfileId, writingId),
  })

  if (isLoading) {
    return <p className="text-[14px] text-black/50">불러오는 중...</p>
  }

  if (isError || !data) {
    return <p className="text-[14px] text-red-700">글을 불러오지 못했어요.</p>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PostMetaCard writing={data} />
      <PostCompareSection writing={data} />
      <PostChangeSummary writing={data} />
      <div className="flex justify-end">
        <Link
          to={`/parent/children/${childId}/report`}
          className="rounded-[5px] border border-black/15 bg-white px-4 py-2 text-[12px] text-black hover:bg-black/5"
        >
          주간 성장 리포트로 돌아가기
        </Link>
      </div>
    </div>
  )
}
