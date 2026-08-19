import { http, HttpResponse } from 'msw'
import type {
  ErrorCandidateResponse,
  PageResponse,
  WritingAnalysisStatus,
  WritingCreateResponse,
  WritingDetailResponse,
  WritingErrorsResponse,
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

function toErrors(writing: MockWriting): WritingErrorsResponse {
  return {
    writingId: writing.writingId,
    status: writing.errorsStatus,
    analyzedText: writing.finalText ?? writing.originalText,
    errors: writing.errors,
    analyzedAt: writing.errorsStatus === 'SUCCEEDED' ? writing.submittedAt : null,
    failureReason: writing.failureReason,
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

    const data: WritingCreateResponse = {
      writingId: writing.writingId,
      inputType: writing.inputType,
      status: writing.status,
    }
    return success(data)
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

    const data: WritingSubmitResponse = { writingId: writing.writingId, status: writing.status }
    return HttpResponse.json({ success: true, data }, { status: writing.inputType === 'PEN' ? 202 : 200 })
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

  http.get('/api/parent/home', () => {
    return HttpResponse.json(parentHomeSummaries)
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

  http.post('/api/ocr', async ({ request }) => {
    const { strokeCount } = (await request.json()) as { strokeCount: number }
    return HttpResponse.json({ text: getOcrSample(strokeCount) })
  }),

  http.post('/api/posts/:postId/analyze', async ({ params, request }) => {
    const { postId } = params
    const { content } = (await request.json()) as { content: string }
    const found = analyzePost(String(postId), content)
    return HttpResponse.json(found)
  }),

  http.get('/api/children/:childId/report/weekly', ({ params }) => {
    const report = weeklyReportByChild(String(params.childId))
    if (!report) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(report)
  }),

  http.get('/api/children/:childId/posts/:postId', ({ params }) => {
    const detail = parentPostById(String(params.postId))
    if (!detail || detail.childId !== String(params.childId)) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(detail)
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
