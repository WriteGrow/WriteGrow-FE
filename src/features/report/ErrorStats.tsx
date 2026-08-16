import type { ParentChildSummary } from '../../mocks/seed'

function errorDeltaLabel(delta: number) {
  if (delta < 0) return `↓ ${Math.abs(delta)}건 감소`
  if (delta > 0) return `↑ ${delta}건 증가`
  return '변화 없음'
}

export function ErrorStats({ child }: { child: ParentChildSummary }) {
  const delta = child.errorDeltaVsLastWeek
  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-5">
      <h3 className="mb-3 text-[16px] font-semibold text-black">{child.name}</h3>
      <dl className="space-y-2.5 text-[12px]">
        <div className="flex justify-between gap-4">
          <dt className="text-black/50">반복 오류 유형</dt>
          <dd className="text-right font-medium">{child.repeatedErrorTypes.join(', ')}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-black/50">이번 주 오류 수</dt>
          <dd className="font-medium">{child.errorsThisWeek}건</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-black/50">지난 주 대비</dt>
          <dd
            className={`font-medium ${delta < 0 ? 'text-brand' : delta > 0 ? 'text-red-700' : ''}`}
          >
            {errorDeltaLabel(delta)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-black/50">자기교정 성공률</dt>
          <dd className="font-medium">{child.selfCorrectionRate}%</dd>
        </div>
      </dl>
    </div>
  )
}
