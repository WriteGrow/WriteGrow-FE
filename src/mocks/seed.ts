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
  confidence: number
  confirmed: boolean
}

export interface Post {
  id: string
  childId: string
  title: string
  content: string
  createdAt: string
  mode: 'pen' | 'keyboard'
  errorCount: number
  lowConfidenceCount: number
}

export const children: Child[] = [
  { id: 'child-1', name: '민지', grade: 2 },
  { id: 'child-2', name: '도윤', grade: 3 },
]

const TOPICS = [
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

const ERROR_TEMPLATES: Array<Pick<ErrorItem, 'type' | 'original' | 'suggestion'>> = [
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

export interface ParentChildSummary {
  childId: string
  name: string
  ageLabel: string
  postsThisWeek: number
  selfCorrections: number
  streakDays: number
  recentTitle: string
  repeatedErrorTypes: string[]
  errorsThisWeek: number
  errorDeltaVsLastWeek: number // 음수 = 감소
  selfCorrectionRate: number // 0~100
  focusArea: string
  focusGuidance: string
}

export const parentHomeSummaries: ParentChildSummary[] = [
  {
    childId: 'child-1',
    name: '김민준',
    ageLabel: '8세',
    postsThisWeek: 3,
    selfCorrections: 2,
    streakDays: 5,
    recentTitle: '오늘 강아지랑 산책했어요',
    repeatedErrorTypes: ['띄어쓰기', '받침'],
    errorsThisWeek: 4,
    errorDeltaVsLastWeek: -2,
    selfCorrectionRate: 67,
    focusArea: '낱말 사이 띄어쓰기',
    focusGuidance: '받침 오류가 꾸준히 줄고 있어요. 이번 주에는 띄어쓰기 습관을 함께 살펴보세요.',
  },
  {
    childId: 'child-2',
    name: '김서연',
    ageLabel: '10세',
    postsThisWeek: 1,
    selfCorrections: 0,
    streakDays: 1,
    recentTitle: '그림 그리는 게 재미있다',
    repeatedErrorTypes: ['조사·어미', '띄어쓰기'],
    errorsThisWeek: 7,
    errorDeltaVsLastWeek: 0,
    selfCorrectionRate: 0,
    focusArea: '조사·어미 바르게 쓰기',
    focusGuidance:
      '조사와 어미 사용에서 같은 오류가 반복되고 있어요. 짧은 문장 쓰기를 격려해 보세요.',
  },
]

export interface WeeklyTrendRow {
  date: string
  sentenceCount: number
  errorCandidates: number
  selfCorrections: number
}

export interface WeeklyPostRow {
  postId: string
  writtenAt: string
  title: string
  errorCount: number
  selfCorrections: number
  status: string
}

export interface ParentWeeklyReport {
  childId: string
  childName: string
  postsThisWeek: number
  postsGoal: number
  selfCorrections: number
  selfCorrectionDelta: number
  repeatedErrorTypeCount: number
  repeatedErrorFocus: string
  lowConfidencePending: number
  majorRepeatedErrors: string[]
  correctionTarget: number
  correctionDone: number
  cumulativeSelfCorrections: number
  trends: WeeklyTrendRow[]
  focusAreaTitle: string
  focusAreaDescription: string
  guidanceTitle: string
  guidanceDescription: string
  posts: WeeklyPostRow[]
}

export const parentWeeklyReports: Record<string, ParentWeeklyReport> = {
  'child-1': {
    childId: 'child-1',
    childName: '김민준',
    postsThisWeek: 5,
    postsGoal: 5,
    selfCorrections: 3,
    selfCorrectionDelta: 1,
    repeatedErrorTypeCount: 4,
    repeatedErrorFocus: '띄어쓰기·받침 중심',
    lowConfidencePending: 2,
    majorRepeatedErrors: ['띄어쓰기', '받침', '조사·어미', '어휘 표현'],
    correctionTarget: 4,
    correctionDone: 3,
    cumulativeSelfCorrections: 12,
    trends: [
      { date: '8/10', sentenceCount: 6, errorCandidates: 3, selfCorrections: 1 },
      { date: '8/11', sentenceCount: 8, errorCandidates: 4, selfCorrections: 2 },
      { date: '8/12', sentenceCount: 5, errorCandidates: 2, selfCorrections: 1 },
      { date: '8/13', sentenceCount: 7, errorCandidates: 3, selfCorrections: 2 },
      { date: '8/14', sentenceCount: 9, errorCandidates: 2, selfCorrections: 2 },
    ],
    focusAreaTitle: '받침 표기',
    focusAreaDescription:
      '3주 연속 반복 오류로 확인되었습니다. 짧은 문장을 직접 읽어보는 활동을 권장합니다.',
    guidanceTitle: '조사·어미 연결',
    guidanceDescription: '자기교정 성공률이 낮아 추가 격려가 필요합니다.',
    posts: [
      {
        postId: 'post-child-1-7',
        writtenAt: '2026.08.14',
        title: '친구와 함께한 놀이',
        errorCount: 2,
        selfCorrections: 1,
        status: '교정 완료',
      },
      {
        postId: 'post-child-1-6',
        writtenAt: '2026.08.13',
        title: '가장 기억에 남는 여행',
        errorCount: 3,
        selfCorrections: 2,
        status: '교정 완료',
      },
      {
        postId: 'post-child-1-5',
        writtenAt: '2026.08.12',
        title: '내가 좋아하는 동물',
        errorCount: 1,
        selfCorrections: 0,
        status: '검토 대기',
      },
      {
        postId: 'post-child-1-4',
        writtenAt: '2026.08.11',
        title: '주말에 가족과 한 일',
        errorCount: 4,
        selfCorrections: 2,
        status: '교정 완료',
      },
    ],
  },
  'child-2': {
    childId: 'child-2',
    childName: '김서연',
    postsThisWeek: 1,
    postsGoal: 5,
    selfCorrections: 0,
    selfCorrectionDelta: -1,
    repeatedErrorTypeCount: 2,
    repeatedErrorFocus: '조사·어미·띄어쓰기',
    lowConfidencePending: 3,
    majorRepeatedErrors: ['조사·어미', '띄어쓰기'],
    correctionTarget: 3,
    correctionDone: 0,
    cumulativeSelfCorrections: 5,
    trends: [
      { date: '8/12', sentenceCount: 4, errorCandidates: 5, selfCorrections: 0 },
      { date: '8/14', sentenceCount: 6, errorCandidates: 4, selfCorrections: 0 },
    ],
    focusAreaTitle: '조사·어미 바르게 쓰기',
    focusAreaDescription:
      '조사와 어미 사용에서 같은 오류가 반복되고 있어요. 짧은 문장 쓰기를 격려해 보세요.',
    guidanceTitle: '띄어쓰기 습관',
    guidanceDescription: '작성량은 적지만 오류 밀도가 높아 함께 읽어보는 시간이 필요합니다.',
    posts: [
      {
        postId: 'post-child-2-6',
        writtenAt: '2026.08.14',
        title: '그림 그리는 게 재미있다',
        errorCount: 7,
        selfCorrections: 0,
        status: '검토 대기',
      },
    ],
  },
}

export function weeklyReportByChild(childId: string): ParentWeeklyReport | undefined {
  return parentWeeklyReports[childId]
}
