export interface Child {
  id: string
  name: string
  grade: number
}

export interface ErrorItem {
  id: string
  postId: string
  type: '맞춤법' | '띄어쓰기' | '문장부호'
  original: string
  suggestion: string
  confidence: number // 0~1
  confirmed: boolean // true=확정 오류, false=낮은확신도 후보
}

export interface Post {
  id: string
  childId: string
  title: string
  content: string
  createdAt: string // ISO date
  mode: 'pen' | 'keyboard'
  errorCount: number
  lowConfidenceCount: number
}

export const children: Child[] = [
  { id: 'child-1', name: '민지', grade: 2 },
  { id: 'child-2', name: '도윤', grade: 3 },
]

export const TOPICS = [
  '오늘 학교에서 있었던 일',
  '주말에 가족과 한 일',
  '내가 좋아하는 동물',
  '가장 기억에 남는 여행',
  '친구와 함께한 놀이',
]

function makePost(index: number, childId: string): Post {
  const mode = index % 3 === 0 ? 'pen' : 'keyboard'
  const errorCount = (index % 4) + 1
  const lowConfidenceCount = index % 3
  return {
    id: `post-${childId}-${index}`,
    childId,
    title: TOPICS[index % TOPICS.length],
    content: `${TOPICS[index % TOPICS.length]}에 대해서 썼어요. 오늘은 정말 즐거운 하루였습니다.`,
    createdAt: new Date(2026, 6, 1 + index).toISOString(),
    mode,
    errorCount,
    lowConfidenceCount,
  }
}

export const posts: Post[] = [
  ...Array.from({ length: 8 }, (_, i) => makePost(i, 'child-1')),
  ...Array.from({ length: 7 }, (_, i) => makePost(i, 'child-2')),
]

export const ERROR_TEMPLATES: Array<Pick<ErrorItem, 'type' | 'original' | 'suggestion'>> = [
  { type: '맞춤법', original: '됬다', suggestion: '됐다' },
  { type: '띄어쓰기', original: '할수있다', suggestion: '할 수 있다' },
  { type: '문장부호', original: '좋아요', suggestion: '좋아요.' },
  { type: '맞춤법', original: '몇일', suggestion: '며칠' },
]

export const errors: ErrorItem[] = posts.flatMap((post) => {
  const total = post.errorCount + post.lowConfidenceCount
  return Array.from({ length: total }, (_, i) => {
    const template = ERROR_TEMPLATES[i % ERROR_TEMPLATES.length]
    const confirmed = i < post.errorCount
    return {
      id: `error-${post.id}-${i}`,
      postId: post.id,
      ...template,
      confidence: confirmed ? 0.9 : 0.4,
      confirmed,
    }
  })
})

export function postsByChild(childId: string): Post[] {
  return posts
    .filter((p) => p.childId === childId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function errorsByPost(postId: string): ErrorItem[] {
  return errors.filter((e) => e.postId === postId)
}

export function findPostById(postId: string): Post | undefined {
  return posts.find((p) => p.id === postId)
}

export function createPost(input: {
  childId: string
  topic: string
  mode: 'pen' | 'keyboard'
  content: string
}): Post {
  const post: Post = {
    id: crypto.randomUUID(),
    childId: input.childId,
    title: input.topic,
    content: input.content,
    createdAt: new Date().toISOString(),
    mode: input.mode,
    errorCount: 0,
    lowConfidenceCount: 0,
  }
  posts.unshift(post)
  return post
}

// 실제 AI 오류 분석(F-QZXONT) 전 단계의 목: ERROR_TEMPLATES에 등록된 문구가
// 본문에 그대로 있으면 오류로 잡는다. 짝수 인덱스는 확정 오류, 홀수는 낮은확신도 후보로 나눠
// 힌트·검토 화면에서 두 상태를 모두 데모할 수 있게 한다.
export function analyzePost(postId: string, content: string): ErrorItem[] {
  const found = ERROR_TEMPLATES.flatMap((template, i): ErrorItem[] => {
    if (!content.includes(template.original)) return []
    return [
      {
        id: crypto.randomUUID(),
        postId,
        ...template,
        confidence: i % 2 === 0 ? 0.9 : 0.55,
        confirmed: i % 2 === 0,
      },
    ]
  })
  errors.push(...found)

  const post = posts.find((p) => p.id === postId)
  if (post) {
    post.content = content
    post.errorCount = found.filter((e) => e.confirmed).length
    post.lowConfidenceCount = found.filter((e) => !e.confirmed).length
  }
  return found
}

// 손글씨 OCR(F-WLRFZD) 전 단계의 목: 실제 인식 대신 ERROR_TEMPLATES의 오류를 포함한
// 캔 텍스트를 돌려줘서, 펜 경로에서도 힌트 화면을 항상 데모할 수 있게 한다.
const OCR_SAMPLES = [
  '오늘 학교에서 정말 재밌는 일이 있었다. 친구들과 놀아서 기분이 됬다. 다음에도 할수있다면 또 놀고 싶다',
  '주말에 가족과 놀러 가서 정말 즐거웠다. 다시 가고 싶다는 생각이 들었다. 몇일 전부터 기대하고 있었다',
]

export function getOcrSample(strokeCount: number): string {
  return OCR_SAMPLES[strokeCount % OCR_SAMPLES.length]
}
