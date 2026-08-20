import { http, HttpResponse } from 'msw'
import type {
  AnalysisResponse,
  ChildErrorProfileResponse,
  ErrorCandidateResponse,
  PageResponse,
  ParentWritingDetailResponse,
  StrokeData,
  WritingAnalysisStatus,
  WritingCreateResponse,
  WritingDetailResponse,
  WritingErrorReviewResponse,
  WritingErrorsResponse,
  WritingErrorType,
  WritingInputType,
  WritingStatus,
  WritingSubmitResponse,
  WritingSummaryResponse,
} from '../lib/apiTypes'
import { DEV_CHILD_ID, DEV_CHILD_PROFILE_ID } from '../lib/devChild'
import {
  analyzePost,
  children,
  createPost,
  errorsByPost,
  findPostById,
  getOcrSample,
  parentHomeSummaries,
  parentPostById,
  parentReviewByChild,
  posts,
  postsByChild,
  weeklyReportByChild,
} from './seed'

function success<T>(data: T) {
  return HttpResponse.json({ success: true, data })
}

function failure(status: number, code: string, message: string) {
  return HttpResponse.json(
    { success: false, error: { code, message, fieldErrors: null } },
    { status },
  )
}

interface MockWriting {
  writingId: number
  postId: string
  inputType: WritingInputType
  status: WritingStatus
  topic: string
  originalText: string
  finalText: string | null
  createdAt: string
  submittedAt: string | null
  errors: ErrorCandidateResponse[]
  errorsStatus: WritingAnalysisStatus
  errorsPollCount: number
  failureReason: string | null
  strokes: StrokeData[]
  receivedBatchSeqs: Set<number>
  imageUploaded: boolean
  canvasWidth: number | null
  canvasHeight: number | null
  analysisStatus: WritingAnalysisStatus
  analysisPollCount: number
  analysisFullText: string | null
}

const mockWritings = new Map<number, MockWriting>()
let nextMockWritingId = 1

function inputTypeFor(mode: 'pen' | 'keyboard'): WritingInputType {
  return mode === 'pen' ? 'PEN' : 'KEYBOARD'
}

function errorTypeFor(index: number): ErrorCandidateResponse['errorType'] {
  const types: ErrorCandidateResponse['errorType'][] = ['SPELLING', 'SPACING', 'SENTENCE_STRUCTURE']
  return types[index % types.length]
}

function toErrorCandidates(postId: string, content: string): ErrorCandidateResponse[] {
  return errorsByPost(postId).map((error, index) => {
    const foundIndex = content.indexOf(error.original)
    const startIndex = foundIndex >= 0 ? foundIndex : index
    return {
      errorType: errorTypeFor(index),
      errorTypeLabel: error.type,
      startIndex,
      endIndex: startIndex + error.original.length,
      originalText: error.original,
      suggestion: error.suggestion,
      confidence: error.confidence,
      reason: null,
    }
  })
}

function ensureMockWriting(post: (typeof posts)[number]): MockWriting {
  const existing = [...mockWritings.values()].find((writing) => writing.postId === post.id)
  if (existing) return existing

  const idParts = /^post-child-(\d+)-(\d+)$/.exec(post.id)
  const childNumber = idParts ? Number(idParts[1]) : 1
  const postNumber = idParts ? Number(idParts[2]) : nextMockWritingId
  const preferredId = childNumber * 1000 + postNumber + 1
  const writingId = mockWritings.has(preferredId) ? nextMockWritingId : preferredId
  nextMockWritingId = Math.max(nextMockWritingId, writingId + 1)

  const writing: MockWriting = {
    writingId,
    postId: post.id,
    inputType: inputTypeFor(post.mode),
    status: 'CONFIRMED',
    topic: post.title,
    originalText: post.content,
    finalText: post.content,
    createdAt: post.createdAt,
    submittedAt: post.createdAt,
    errors: toErrorCandidates(post.id, post.content),
    errorsStatus: 'SUCCEEDED',
    errorsPollCount: 0,
    failureReason: null,
    strokes: [],
    receivedBatchSeqs: new Set(),
    imageUploaded: false,
    canvasWidth: null,
    canvasHeight: null,
    analysisStatus: post.mode === 'pen' ? 'PENDING' : 'SUCCEEDED',
    analysisPollCount: 0,
    analysisFullText: post.mode === 'pen' ? null : post.content,
  }
  mockWritings.set(writingId, writing)
  return writing
}

for (const post of posts) ensureMockWriting(post)

function findMockWriting(writingId: number) {
  return mockWritings.get(writingId)
}

function toSummary(writing: MockWriting): WritingSummaryResponse {
  return {
    writingId: writing.writingId,
    inputType: writing.inputType,
    status: writing.status,
    topic: writing.topic,
    preview: (writing.finalText ?? writing.originalText).slice(0, 30),
    createdAt: writing.createdAt,
    submittedAt: writing.submittedAt,
  }
}

function toDetail(writing: MockWriting): WritingDetailResponse {
  return {
    writingId: writing.writingId,
    profileId: DEV_CHILD_PROFILE_ID,
    inputType: writing.inputType,
    status: writing.status,
    topic: writing.topic,
    originalText: writing.originalText,
    finalText: writing.finalText,
    createdAt: writing.createdAt,
    submittedAt: writing.submittedAt,
  }
}

function toParentWritingDetail(
  writing: MockWriting,
  childProfileId: number,
): ParentWritingDetailResponse {
  const child = parentHomeSummaries.find((item) => item.profileId === childProfileId)
  const parentPost = parentPostById(writing.postId)
  const confirmedErrors = parentPost
    ? parentPost.changes.map((change, index) => {
        const foundIndex = parentPost.originalContent.indexOf(change.original)
        const startIndex = foundIndex >= 0 ? foundIndex : index
        return {
          errorType: errorTypeFor(index),
          errorTypeLabel: parentPost.correctionTypes[0] ?? '교정',
          startIndex,
          endIndex: startIndex + change.original.length,
          originalText: change.original,
          suggestion: change.corrected,
          confidence: 0.9,
          reason: null,
        }
      })
    : writing.errors

  const finalText = parentPost?.revisedContent ?? writing.finalText
  const originalText = parentPost?.originalContent ?? writing.originalText

  return {
    writingId: writing.writingId,
    profileId: childProfileId,
    nickname: child?.nickname ?? '아이',
    topic: writing.topic,
    inputType: writing.inputType,
    status: writing.status,
    createdAt: writing.createdAt,
    submittedAt: writing.submittedAt,
    originalText,
    finalText,
    sentenceCount: Math.max(1, originalText.split(/[.!?。]+/).filter(Boolean).length),
    selfCorrectionCount: parentPost?.selfCorrectionDone ?? confirmedErrors.length,
    revisions: [
      {
        revisionNo: 1,
        content: finalText ?? originalText,
        source: writing.inputType === 'PEN' ? 'OCR' : 'CHILD_EDIT',
        createdAt: writing.submittedAt ?? writing.createdAt,
      },
    ],
    confirmedErrors,
    reviewPendingCount: parentPost
      ? Math.max(0, parentPost.selfCorrectionTotal - parentPost.selfCorrectionDone)
      : 0,
  }
}

const ERROR_PROFILE_TYPES: Array<{ errorType: WritingErrorType; errorTypeLabel: string }> = [
  { errorType: 'SPELLING', errorTypeLabel: '맞춤법' },
  { errorType: 'SPACING', errorTypeLabel: '띄어쓰기' },
  { errorType: 'FINAL_CONSONANT', errorTypeLabel: '받침' },
  { errorType: 'PARTICLE_ENDING', errorTypeLabel: '조사·어미' },
  { errorType: 'SENTENCE_STRUCTURE', errorTypeLabel: '문장 구조' },
  { errorType: 'VOCABULARY', errorTypeLabel: '어휘' },
]

function toErrorReview(writing: MockWriting): WritingErrorReviewResponse {
  const confirmed = writing.errors.filter((error) => error.confidence >= 0.9)
  const reviewCandidates = writing.errors.filter((error) => error.confidence < 0.9)
  const candidates =
    reviewCandidates.length > 0
      ? reviewCandidates
      : writing.errors.slice(0, Math.min(2, writing.errors.length)).map((error) => ({
          ...error,
          confidence: Math.min(error.confidence, 0.72),
        }))

  return {
    writingId: writing.writingId,
    status: writing.errorsStatus,
    analyzedText: writing.finalText ?? writing.originalText,
    reviewCount: candidates.length,
    confirmedCount: confirmed.length || Math.max(0, writing.errors.length - candidates.length),
    reviewCandidates: candidates,
    analyzedAt: writing.submittedAt,
  }
}

function toErrorProfile(childProfileId: number): ChildErrorProfileResponse {
  const report = weeklyReportByChild(String(childProfileId))
  const byType = new Map((report?.repeatedErrors ?? []).map((item) => [item.errorType, item]))

  const items = ERROR_PROFILE_TYPES.map(({ errorType, errorTypeLabel }) => {
    const found = byType.get(errorType)
    const occurrenceCount = found?.cumulativeCount ?? 0
    const correctionSuccessCount = Math.round(occurrenceCount * 0.67)
    return {
      errorType,
      errorTypeLabel: found?.label ?? errorTypeLabel,
      occurrenceCount,
      correctionSuccessCount,
      correctionRate: occurrenceCount === 0 ? 0 : correctionSuccessCount / occurrenceCount,
      lastOccurredOn: found?.lastOccurredOn ?? '',
    }
  }).sort((a, b) => b.occurrenceCount - a.occurrenceCount)

  return { profileId: childProfileId, items }
}

function toErrors(writing: MockWriting): WritingErrorsResponse {
  return {
    writingId: writing.writingId,
    status: writing.errorsStatus,
    analyzedText: writing.finalText ?? writing.analysisFullText ?? writing.originalText,
    errors: writing.errors,
    analyzedAt: writing.errorsStatus === 'SUCCEEDED' ? writing.submittedAt : null,
    failureReason: writing.failureReason,
  }
}

function toAnalysis(writing: MockWriting): AnalysisResponse {
  const fullText = writing.analysisFullText
  const midpoint = fullText ? Math.max(1, Math.floor(fullText.length / 2)) : 0
  const segments = fullText
    ? [
        {
          seq: 0,
          text: fullText.slice(0, midpoint),
          confidence: 0.94,
          startIndex: 0,
          endIndex: midpoint,
          lowConfidence: false,
        },
        {
          seq: 1,
          text: fullText.slice(midpoint),
          confidence: 0.58,
          startIndex: midpoint,
          endIndex: fullText.length,
          lowConfidence: true,
        },
      ]
    : []

  return {
    writingId: writing.writingId,
    status: writing.analysisStatus,
    fullText,
    overallConfidence: fullText ? 0.82 : null,
    provider: 'stub',
    requestedAt: writing.submittedAt,
    completedAt: writing.analysisStatus === 'SUCCEEDED' ? writing.submittedAt : null,
    failureReason: writing.analysisStatus === 'FAILED' ? writing.failureReason : null,
    segments,
    processMetric:
      writing.analysisStatus === 'SUCCEEDED'
        ? {
            totalDurationMs: writing.strokes.at(-1)?.penUpAt ?? 0,
            pauseCount: 0,
            longestPauseMs: 0,
            avgStrokeDurationMs:
              writing.strokes.length > 0
                ? Math.round(
                    writing.strokes.reduce((total, stroke) => total + stroke.penUpAt - stroke.penDownAt, 0) /
                      writing.strokes.length,
                  )
                : 0,
            hesitationPoints: [],
          }
        : null,
    handwriting:
      writing.imageUploaded
        ? {
            imageUrl: `/mock/writings/${writing.writingId}/handwriting.png`,
            strokeDataUrl: `/mock/writings/${writing.writingId}/strokes.json`,
            strokeCount: writing.strokes.length,
            totalDurationMs: writing.strokes.at(-1)?.penUpAt ?? 0,
            canvasWidth: writing.canvasWidth ?? 0,
            canvasHeight: writing.canvasHeight ?? 0,
          }
        : null,
  }
}

export const handlers = [
  http.get('/api/writings', ({ request }) => {
    const url = new URL(request.url)
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
    const size = Math.max(1, Number(url.searchParams.get('size') ?? 20))
    const allContent = postsByChild(DEV_CHILD_ID).map((post) => toSummary(ensureMockWriting(post)))
    const content = allContent.slice(page * size, page * size + size)
    const totalPages = Math.ceil(allContent.length / size)
    const data: PageResponse<WritingSummaryResponse> = {
      content,
      page,
      size,
      totalElements: allContent.length,
      totalPages,
      last: totalPages === 0 || page >= totalPages - 1,
    }
    return success(data)
  }),

  http.post('/api/writings', async ({ request }) => {
    let body: { inputType?: unknown; topic?: unknown } = {}
    try {
      body = (await request.json()) as typeof body
    } catch {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }

    if (body.inputType !== 'KEYBOARD' && body.inputType !== 'PEN') {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }

    const inputType = body.inputType as WritingInputType
    const post = createPost({
      childId: DEV_CHILD_ID,
      topic: typeof body.topic === 'string' ? body.topic : '',
      mode: inputType === 'PEN' ? 'pen' : 'keyboard',
      content: '',
    })
    const writing = ensureMockWriting(post)
    writing.status = 'DRAFT'
    writing.finalText = null
    writing.submittedAt = null
    writing.errors = []
    writing.errorsStatus = 'PENDING'
    writing.errorsPollCount = 0
    writing.failureReason = null
    writing.strokes = []
    writing.receivedBatchSeqs.clear()
    writing.imageUploaded = false
    writing.canvasWidth = null
    writing.canvasHeight = null
    writing.analysisStatus = inputType === 'PEN' ? 'PENDING' : 'SUCCEEDED'
    writing.analysisPollCount = 0
    writing.analysisFullText = null

    const data: WritingCreateResponse = {
      writingId: writing.writingId,
      inputType: writing.inputType,
      status: writing.status,
    }
    return HttpResponse.json({ success: true, data }, { status: 201 })
  }),

  http.post('/api/writings/:writingId/strokes', async ({ params, request }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')
    if (writing.inputType !== 'PEN') return failure(400, 'NOT_HANDWRITING', '손글씨 글에만 사용할 수 있어요.')

    let body: { batchSeq?: unknown; strokes?: unknown } = {}
    try {
      body = (await request.json()) as typeof body
    } catch {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }
    const batchSeq = typeof body.batchSeq === 'number' ? body.batchSeq : 0
    const strokes = Array.isArray(body.strokes) ? (body.strokes as StrokeData[]) : []
    if (strokes.length === 0) return failure(400, 'STROKE_DATA_REQUIRED', '획 데이터가 필요합니다.')

    const duplicated = writing.receivedBatchSeqs.has(batchSeq)
    if (!duplicated) {
      writing.receivedBatchSeqs.add(batchSeq)
      writing.strokes.push(...strokes)
    }
    return success({
      writingId: writing.writingId,
      batchSeq,
      strokeCount: strokes.length,
      totalBatches: writing.receivedBatchSeqs.size,
      duplicated,
    })
  }),

  http.post('/api/writings/:writingId/handwriting-image', async ({ params, request }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')
    if (writing.inputType !== 'PEN') return failure(400, 'NOT_HANDWRITING', '손글씨 글에만 사용할 수 있어요.')

    const formData = await request.formData()
    if (!formData.get('file')) return failure(400, 'IMAGE_REQUIRED', '손글씨 이미지가 필요합니다.')
    const url = new URL(request.url)
    writing.imageUploaded = true
    writing.canvasWidth = Number(url.searchParams.get('canvasWidth') ?? 0) || null
    writing.canvasHeight = Number(url.searchParams.get('canvasHeight') ?? 0) || null
    return success({
      writingId: writing.writingId,
      imageUrl: `/mock/writings/${writing.writingId}/handwriting.png`,
    })
  }),

  http.post('/api/writings/:writingId/submit', async ({ params, request }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')

    let body: { content?: unknown } = {}
    try {
      body = (await request.json()) as typeof body
    } catch {
      body = {}
    }
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (writing.inputType === 'KEYBOARD' && !content) {
      return failure(400, 'EMPTY_CONTENT', '빈 글은 제출할 수 없습니다.')
    }
    if (writing.inputType === 'PEN' && (writing.strokes.length === 0 || !writing.imageUploaded)) {
      return failure(400, 'HANDWRITING_DATA_REQUIRED', '손글씨 획과 이미지가 필요합니다.')
    }

    const post = findPostById(writing.postId)
    if (post && content) analyzePost(post.id, content)
    writing.originalText = content
    writing.finalText = content || null
    writing.submittedAt = new Date().toISOString()
    writing.status = writing.inputType === 'KEYBOARD' ? 'CONFIRMED' : 'SUBMITTED'
    writing.errors = post ? toErrorCandidates(post.id, content) : []
    writing.errorsStatus = 'PENDING'
    writing.errorsPollCount = 0
    writing.failureReason = null
    if (writing.inputType === 'PEN') {
      writing.analysisStatus = 'PENDING'
      writing.analysisPollCount = 0
      writing.analysisFullText = null
    }

    const data: WritingSubmitResponse = { writingId: writing.writingId, status: writing.status }
    return HttpResponse.json({ success: true, data }, { status: writing.inputType === 'PEN' ? 202 : 200 })
  }),

  http.get('/api/writings/:writingId/analysis', ({ params }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')
    if (writing.inputType !== 'PEN') return failure(400, 'NOT_HANDWRITING', '손글씨 글에만 사용할 수 있어요.')

    if (writing.analysisStatus === 'PENDING' || writing.analysisStatus === 'PROCESSING') {
      writing.analysisPollCount += 1
      if (writing.analysisPollCount >= 2) {
        writing.analysisStatus = 'SUCCEEDED'
        writing.analysisFullText = getOcrSample(writing.strokes.length)
        writing.status = 'ANALYZED'
      } else {
        writing.analysisStatus = 'PROCESSING'
      }
    }
    return success(toAnalysis(writing))
  }),

  http.patch('/api/writings/:writingId/text', async ({ params, request }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')
    if (writing.inputType !== 'PEN') return failure(400, 'NOT_HANDWRITING', '손글씨 글에만 사용할 수 있어요.')
    let body: { content?: unknown } = {}
    try {
      body = (await request.json()) as typeof body
    } catch {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!content) return failure(400, 'EMPTY_CONTENT', '빈 글은 확정할 수 없습니다.')
    if (writing.analysisStatus !== 'SUCCEEDED') {
      return failure(409, 'ANALYSIS_NOT_COMPLETE', '손글씨 변환이 아직 끝나지 않았습니다.')
    }

    const post = findPostById(writing.postId)
    if (post) analyzePost(post.id, content)
    writing.originalText = writing.analysisFullText ?? content
    writing.finalText = content
    writing.status = 'CONFIRMED'
    writing.errors = post ? toErrorCandidates(post.id, content) : []
    writing.errorsStatus = 'PENDING'
    writing.errorsPollCount = 0
    return success({
      writingId: writing.writingId,
      status: writing.status,
      finalText: content,
      edited: content !== writing.analysisFullText,
    })
  }),

  http.post('/api/writings/:writingId/rewrite', ({ params }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')
    if (writing.inputType !== 'PEN') return failure(400, 'NOT_HANDWRITING', '손글씨 글에만 사용할 수 있어요.')
    if (writing.analysisStatus !== 'SUCCEEDED') {
      return failure(409, 'ANALYSIS_NOT_COMPLETE', '손글씨 변환이 아직 끝나지 않았습니다.')
    }

    writing.status = 'DRAFT'
    writing.originalText = ''
    writing.finalText = null
    writing.errors = []
    writing.errorsStatus = 'PENDING'
    writing.errorsPollCount = 0
    writing.analysisStatus = 'PENDING'
    writing.analysisPollCount = 0
    writing.analysisFullText = null
    writing.receivedBatchSeqs.clear()
    return success({
      writingId: writing.writingId,
      inputType: writing.inputType,
      status: writing.status,
    })
  }),

  http.get('/api/writings/:writingId/errors', ({ params }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')

    if (writing.errorsStatus === 'PENDING' || writing.errorsStatus === 'PROCESSING') {
      writing.errorsPollCount += 1
      writing.errorsStatus = writing.errorsPollCount >= 2 ? 'SUCCEEDED' : 'PROCESSING'
    }
    return success(toErrors(writing))
  }),

  http.get('/api/writings/:writingId', ({ params }) => {
    const writing = findMockWriting(Number(params.writingId))
    if (!writing) return failure(404, 'NOT_FOUND', '글을 찾을 수 없습니다.')
    return success(toDetail(writing))
  }),

  http.get('/api/children', () => {
    return HttpResponse.json(children)
  }),

  http.get('/api/parents/home', ({ request }) => {
    const profileId = request.headers.get('X-Profile-Id')
    if (!profileId) {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }
    if (profileId !== '1' && profileId !== '2') {
      return failure(404, 'PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.')
    }
    return success({
      accountId: 1,
      children: parentHomeSummaries,
    })
  }),

  http.get('/api/children/:childId/posts', ({ params }) => {
    const { childId } = params
    return HttpResponse.json(postsByChild(String(childId)))
  }),

  http.post('/api/children/:childId/posts', async ({ params, request }) => {
    const { childId } = params
    const body = (await request.json()) as {
      topic: string
      mode: 'pen' | 'keyboard'
      content: string
    }
    const post = createPost({ childId: String(childId), ...body })
    return HttpResponse.json(post)
  }),

  http.get('/api/posts/:postId', ({ params }) => {
    const post = findPostById(String(params.postId))
    if (!post) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(post)
  }),

  http.post('/api/posts/:postId/analyze', async ({ params, request }) => {
    const { postId } = params
    const { content } = (await request.json()) as { content: string }
    const found = analyzePost(String(postId), content)
    return HttpResponse.json(found)
  }),

  http.get('/api/children/:childProfileId/weekly-report', ({ params, request }) => {
    const profileHeader = request.headers.get('X-Profile-Id')
    if (!profileHeader) {
      return failure(400, 'MISSING_PROFILE_HEADER', 'X-Profile-Id 헤더가 필요합니다.')
    }
    const report = weeklyReportByChild(String(params.childProfileId))
    if (!report) return failure(404, 'PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.')
    return success(report)
  }),

  http.get('/api/children/:childId/report/weekly', ({ params }) => {
    const report = weeklyReportByChild(String(params.childId))
    if (!report) return new HttpResponse(null, { status: 404 })
    return success(report)
  }),

  http.get('/api/children/:childProfileId/writings', ({ params, request }) => {
    const profileHeader = request.headers.get('X-Profile-Id')
    if (!profileHeader) {
      return failure(400, 'MISSING_PROFILE_HEADER', 'X-Profile-Id 헤더가 필요합니다.')
    }

    const childProfileId = Number(params.childProfileId)
    if (!Number.isFinite(childProfileId)) {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }

    const url = new URL(request.url)
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
    const size = Math.max(1, Number(url.searchParams.get('size') ?? 20))
    const childId = `child-${childProfileId}`
    const allContent = postsByChild(childId).map((post) => toSummary(ensureMockWriting(post)))
    const content = allContent.slice(page * size, page * size + size)
    const totalPages = Math.ceil(allContent.length / size)
    const data: PageResponse<WritingSummaryResponse> = {
      content,
      page,
      size,
      totalElements: allContent.length,
      totalPages,
      last: totalPages === 0 || page >= totalPages - 1,
    }
    return success(data)
  }),

  http.get('/api/children/:childProfileId/writings/:writingId', ({ params, request }) => {
    const profileHeader = request.headers.get('X-Profile-Id')
    if (!profileHeader) {
      return failure(400, 'MISSING_PROFILE_HEADER', 'X-Profile-Id 헤더가 필요합니다.')
    }

    const childProfileId = Number(params.childProfileId)
    const writingId = Number(params.writingId)
    if (!Number.isFinite(childProfileId) || !Number.isFinite(writingId)) {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }

    const writing = findMockWriting(writingId)
    if (!writing) {
      return failure(404, 'WRITING_NOT_FOUND', '글을 찾을 수 없습니다.')
    }

    return success(toParentWritingDetail(writing, childProfileId))
  }),

  http.get('/api/writings/:writingId/error-review', ({ params, request }) => {
    const profileHeader = request.headers.get('X-Profile-Id')
    if (!profileHeader) {
      return failure(400, 'MISSING_PROFILE_HEADER', 'X-Profile-Id 헤더가 필요합니다.')
    }

    const writingId = Number(params.writingId)
    if (!Number.isFinite(writingId)) {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }

    const writing = findMockWriting(writingId)
    if (!writing) {
      return failure(404, 'WRITING_NOT_FOUND', '글을 찾을 수 없습니다.')
    }

    return success(toErrorReview(writing))
  }),

  http.get('/api/children/:childProfileId/error-profile', ({ params, request }) => {
    const profileHeader = request.headers.get('X-Profile-Id')
    if (!profileHeader) {
      return failure(400, 'MISSING_PROFILE_HEADER', 'X-Profile-Id 헤더가 필요합니다.')
    }

    const childProfileId = Number(params.childProfileId)
    if (!Number.isFinite(childProfileId)) {
      return failure(400, 'INVALID_REQUEST', '요청 값이 올바르지 않습니다.')
    }

    return success(toErrorProfile(childProfileId))
  }),

  http.get('/api/children/:childId/review', ({ params }) => {
    const review = parentReviewByChild(String(params.childId))
    if (!review) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(review)
  }),

  http.get('/api/posts/:postId/errors', ({ params }) => {
    const { postId } = params
    return HttpResponse.json(errorsByPost(String(postId)))
  }),
]
