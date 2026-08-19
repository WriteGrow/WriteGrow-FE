import { TOPICS } from '../lib/topics'

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
      { date: '2026.08.10', sentenceCount: 6, errorCandidates: 3, selfCorrections: 1 },
      { date: '2026.08.11', sentenceCount: 8, errorCandidates: 4, selfCorrections: 2 },
      { date: '2026.08.12', sentenceCount: 5, errorCandidates: 2, selfCorrections: 1 },
      { date: '2026.08.13', sentenceCount: 7, errorCandidates: 3, selfCorrections: 2 },
      { date: '2026.08.14', sentenceCount: 9, errorCandidates: 2, selfCorrections: 2 },
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

export interface PostChange {
  original: string
  corrected: string
}

export interface ParentPostDetail {
  postId: string
  childId: string
  authorName: string
  ageLabel: string
  writtenAtLabel: string
  title: string
  submissionCount: number
  originalContent: string
  revisedContent: string
  changedCount: number
  selfCorrectionDone: number
  selfCorrectionTotal: number
  correctionTypes: string[]
  changes: PostChange[]
  summaryNote: string
}

export const parentPostDetails: Record<string, ParentPostDetail> = {
  'post-child-1-7': {
    postId: 'post-child-1-7',
    childId: 'child-1',
    authorName: '김민준',
    ageLabel: '8세',
    writtenAtLabel: '2026년 8월 14일 (금)',
    title: '오늘 공원에서 있었던 일',
    submissionCount: 3,
    originalContent:
      '오늘 공원에서가서 친구랑 축구를 했어요. 공이 너무 높이 올라가서 잡지 못했어요. 그래도 재미 있었어요.',
    revisedContent:
      '오늘 공원에 가서 친구랑 축구를 했어요. 공이 너무 높이 올라가서 잡지 못했어요. 그래도 재미있었어요.',
    changedCount: 2,
    selfCorrectionDone: 2,
    selfCorrectionTotal: 2,
    correctionTypes: ['띄어쓰기'],
    changes: [
      { original: '공원에서가서', corrected: '공원에 가서' },
      { original: '재미 있었어요', corrected: '재미있었어요' },
    ],
    summaryNote:
      '이 글에서 민준이는 힌트를 보고 스스로 두 곳을 고쳤습니다. 원문의 자유로운 표현은 그대로 유지되었습니다.',
  },
  'post-child-1-6': {
    postId: 'post-child-1-6',
    childId: 'child-1',
    authorName: '김민준',
    ageLabel: '8세',
    writtenAtLabel: '2026년 8월 13일 (목)',
    title: '가장 기억에 남는 여행',
    submissionCount: 2,
    originalContent:
      '지난 주말에 바다에갔어요. 파도가 커서 신기했어요. 모래성도 만들고 조개도 주웠어요.',
    revisedContent:
      '지난 주말에 바다에 갔어요. 파도가 커서 신기했어요. 모래성도 만들고 조개도 주웠어요.',
    changedCount: 1,
    selfCorrectionDone: 1,
    selfCorrectionTotal: 1,
    correctionTypes: ['띄어쓰기'],
    changes: [{ original: '바다에갔어요', corrected: '바다에 갔어요' }],
    summaryNote:
      '이 글에서 민준이는 힌트를 보고 스스로 한 곳을 고쳤습니다. 원문의 자유로운 표현은 그대로 유지되었습니다.',
  },
  'post-child-1-5': {
    postId: 'post-child-1-5',
    childId: 'child-1',
    authorName: '김민준',
    ageLabel: '8세',
    writtenAtLabel: '2026년 8월 12일 (수)',
    title: '내가 좋아하는 동물',
    submissionCount: 1,
    originalContent: '나는 강아지를 좋아해요. 꼬리를 흔들때 귀여워요.',
    revisedContent: '나는 강아지를 좋아해요. 꼬리를 흔들 때 귀여워요.',
    changedCount: 1,
    selfCorrectionDone: 0,
    selfCorrectionTotal: 1,
    correctionTypes: ['띄어쓰기'],
    changes: [{ original: '흔들때', corrected: '흔들 때' }],
    summaryNote:
      '이 글에는 아직 자기교정이 끝나지 않은 항목이 있어요. 함께 다시 읽어보면 좋겠습니다.',
  },
  'post-child-1-4': {
    postId: 'post-child-1-4',
    childId: 'child-1',
    authorName: '김민준',
    ageLabel: '8세',
    writtenAtLabel: '2026년 8월 11일 (화)',
    title: '주말에 가족과 한 일',
    submissionCount: 4,
    originalContent: '주말에 할머니집에갔어요. 맛있는 과일도 먹고 이야기도 많이 했어요.',
    revisedContent: '주말에 할머니 집에 갔어요. 맛있는 과일도 먹고 이야기도 많이 했어요.',
    changedCount: 1,
    selfCorrectionDone: 1,
    selfCorrectionTotal: 1,
    correctionTypes: ['띄어쓰기'],
    changes: [{ original: '할머니집에갔어요', corrected: '할머니 집에 갔어요' }],
    summaryNote:
      '이 글에서 민준이는 힌트를 보고 스스로 한 곳을 고쳤습니다. 원문의 자유로운 표현은 그대로 유지되었습니다.',
  },
  'post-child-2-6': {
    postId: 'post-child-2-6',
    childId: 'child-2',
    authorName: '김서연',
    ageLabel: '10세',
    writtenAtLabel: '2026년 8월 14일 (금)',
    title: '그림 그리는 게 재미있다',
    submissionCount: 1,
    originalContent: '나는 그림그리는게 재미있다. 색깔을 섞으면 새로운색이 나와서 신기하다.',
    revisedContent: '나는 그림 그리는 게 재미있다. 색깔을 섞으면 새로운 색이 나와서 신기하다.',
    changedCount: 2,
    selfCorrectionDone: 0,
    selfCorrectionTotal: 2,
    correctionTypes: ['띄어쓰기'],
    changes: [
      { original: '그림그리는게', corrected: '그림 그리는 게' },
      { original: '새로운색이', corrected: '새로운 색이' },
    ],
    summaryNote:
      '이 글에는 아직 자기교정이 끝나지 않은 항목이 있어요. 함께 다시 읽어보면 좋겠습니다.',
  },
}

export function parentPostById(postId: string): ParentPostDetail | undefined {
  return parentPostDetails[postId]
}

export interface ReviewCandidate {
  id: string
  label: string
  originalText: string
  aiAnalysis: string
  lowConfidenceReason: string
  before: string
  after: string
}

export interface ParentReviewData {
  childId: string
  reviewTargetCount: number
  confirmedErrorCount: number
  autoApplied: boolean
  candidates: ReviewCandidate[]
}

export const parentReviews: Record<string, ParentReviewData> = {
  'child-1': {
    childId: 'child-1',
    reviewTargetCount: 4,
    confirmedErrorCount: 12,
    autoApplied: false,
    candidates: [
      {
        id: 'review-1',
        label: '후보 1',
        originalText: '나는 학교에 갔다가 집에왔다.',
        aiAnalysis: '띄어쓰기 오류로 보이며 "집에 왔다"로 수정하는 것이 자연스럽습니다.',
        lowConfidenceReason: '구어체 표현일 수 있어 의도 판단이 불분명합니다.',
        before: '집에왔다',
        after: '집에 왔다',
      },
      {
        id: 'review-2',
        label: '후보 2',
        originalText: '우리 강아지는 되게 귀엽고 활발해요.',
        aiAnalysis: '구어체 표현 "되게"를 표준어 "매우"로 바꾸는 것이 더 자연스러울 수 있습니다.',
        lowConfidenceReason: '아동의 자연스러운 구어체일 수 있어 교정 필요 여부가 불분명합니다.',
        before: '되게',
        after: '매우',
      },
      {
        id: 'review-3',
        label: '후보 3',
        originalText: '밥을먹고 숙제를 했어요.',
        aiAnalysis: '띄어쓰기 오류로 보이며 "밥을 먹고"로 수정하는 것이 맞습니다.',
        lowConfidenceReason: '필기·OCR 인식 오류 가능성도 있어 확신도가 낮습니다.',
        before: '밥을먹고',
        after: '밥을 먹고',
      },
      {
        id: 'review-4',
        label: '후보 4',
        originalText: '친구한테 선물을 줬는데 친구가 좋아했어요.',
        aiAnalysis: '조사 "한테"를 더 표준적인 "에게"로 바꾸는 것을 제안합니다.',
        lowConfidenceReason: '구어체 조사 사용이 자연스러울 수 있어 교정 필요성이 애매합니다.',
        before: '친구한테',
        after: '친구에게',
      },
    ],
  },
  'child-2': {
    childId: 'child-2',
    reviewTargetCount: 3,
    confirmedErrorCount: 5,
    autoApplied: false,
    candidates: [
      {
        id: 'review-c2-1',
        label: '후보 1',
        originalText: '그림그리는게 제일 재미있어요.',
        aiAnalysis: '띄어쓰기를 "그림 그리는 게"로 나누는 것이 자연스럽습니다.',
        lowConfidenceReason: '아동 문체상 붙여 쓴 표현일 수 있어 확신도가 낮습니다.',
        before: '그림그리는게',
        after: '그림 그리는 게',
      },
      {
        id: 'review-c2-2',
        label: '후보 2',
        originalText: '색깔을 섞으면 새로운색이 나와요.',
        aiAnalysis: '"새로운 색이"로 띄어 쓰는 것이 맞습니다.',
        lowConfidenceReason: 'OCR로 공백이 누락됐을 가능성도 있습니다.',
        before: '새로운색이',
        after: '새로운 색이',
      },
      {
        id: 'review-c2-3',
        label: '후보 3',
        originalText: '오늘은 진짜 기분이 좋았다.',
        aiAnalysis: '구어체 "진짜"를 "정말"로 바꾸는 것을 제안합니다.',
        lowConfidenceReason: '자연스러운 아동 표현일 수 있어 교정 여부가 불분명합니다.',
        before: '진짜',
        after: '정말',
      },
    ],
  },
}

export function parentReviewByChild(childId: string): ParentReviewData | undefined {
  return parentReviews[childId]
}
