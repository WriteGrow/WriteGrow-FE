import type { WeeklyTrendRow } from '../../../mocks/seed'

export function WeeklyTrendTable({ trends }: { trends: WeeklyTrendRow[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px] font-semibold text-black">최근 작성량 및 오류 변화 추이</h2>
      <div className="overflow-x-auto rounded-[10px] border border-black/10 bg-white p-5">
        <div className="overflow-hidden rounded-[10px] border border-black/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
            <thead>
              <tr className="border-b border-black/10 bg-[#f3f4f6] text-black/50">
                <th className="px-4 py-2.5 font-medium">날짜</th>
                <th className="px-4 py-2.5 font-medium">작성 문장 수</th>
                <th className="px-4 py-2.5 font-medium">오류 후보</th>
                <th className="px-4 py-2.5 font-medium">자기교정 완료</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((row) => (
                <tr key={row.date} className="border-b border-black/10 last:border-b-0">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.sentenceCount}</td>
                  <td className="px-4 py-2">{row.errorCandidates}</td>
                  <td className="px-4 py-2">{row.selfCorrections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
