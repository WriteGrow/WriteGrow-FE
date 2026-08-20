import { Link } from 'react-router-dom'
import type { ParentHomeChild } from './errorTypeLabels'

export function ActivityCard({ child }: { child: ParentHomeChild }) {
  return (
    <article className="flex flex-col rounded-[10px] border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-[16px] font-semibold text-black">
        {child.nickname} ({child.age}세)
      </h3>

      <dl className="mb-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <dt className="text-[12px] text-black/50">이번 주 작성</dt>
          <dd className="mt-1 text-[18px] font-bold">{child.weeklyWritingCount}편</dd>
        </div>
        <div>
          <dt className="text-[12px] text-black/50">자기교정 완료</dt>
          <dd className="mt-1 text-[18px] font-bold">{child.selfCorrectionCount}회</dd>
        </div>
        <div>
          <dt className="text-[12px] text-black/50">연속 작성</dt>
          <dd className="mt-1 text-[18px] font-bold">{child.writingStreakDays}일</dd>
        </div>
      </dl>

      <div className="mb-3 flex items-start justify-between gap-3 border-t border-black/10 pt-3 text-[12px]">
        <p className="min-w-0 text-black/70">
          <span className="text-black/45">
            최근 글 : {child.recentWritingPreview ?? '아직 작성한 글이 없어요'}
          </span>
        </p>
        <Link
          to={`/parent/children/${child.profileId}/writings`}
          className="shrink-0 text-black underline-offset-2 hover:underline"
        >
          글 기록 보기
        </Link>
      </div>

      <Link
        to={`/parent/children/${child.profileId}/report`}
        className="mt-auto block w-full rounded-[5px] bg-black px-4 py-2.5 text-center text-[12px] font-semibold text-white hover:bg-black/90"
      >
        주간 성장 리포트 보기
      </Link>
    </article>
  )
}
