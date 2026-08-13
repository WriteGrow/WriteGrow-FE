import { useQuery } from '@tanstack/react-query'
import type { Child } from '../../mocks/seed'

export function ParentHome() {
  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async (): Promise<Child[]> => {
      const res = await fetch('/api/children')
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">우리 아이 글쓰기</h1>
      {isLoading && <p>불러오는 중...</p>}
      <ul className="space-y-2">
        {children?.map((child) => (
          <li key={child.id} className="min-h-touch rounded-lg border border-ink/10 p-4">
            {child.name} · {child.grade}학년
          </li>
        ))}
      </ul>
    </div>
  )
}
