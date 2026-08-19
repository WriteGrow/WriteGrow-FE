import { DEV_CHILD_ID, DEV_CHILD_PROFILE_ID } from './devChild'
import type {
  ApiErrorBody,
  ErrorCandidateResponse,
  ErrorResponse,
  PageResponse,
  WritingDetailResponse,
  WritingErrorsResponse,
  WritingInputType,
  WritingSummaryResponse,
} from './apiTypes'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
const USE_REAL_API = API_BASE_URL.length > 0

export class ApiRequestError extends Error {
  readonly code: string
  readonly fieldErrors: Record<string, string[]> | null
  readonly status: number

  constructor(error: ApiErrorBody, status: number) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.code = error.code
    this.fieldErrors = error.fieldErrors
    this.status = status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!isRecord(value) || value.success !== false || !isRecord(value.error)) return false
  return typeof value.error.code === 'string' && typeof value.error.message === 'string'
}

function isApiResponse<T>(value: unknown): value is { success: true; data: T } {
  return isRecord(value) && value.success === true && 'data' in value
}

function toApiUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

async function fetchJson(path: string): Promise<{ response: Response; body: unknown }> {
  const headers = new Headers({ 'X-Profile-Id': String(DEV_CHILD_PROFILE_ID) })
  const response = await fetch(toApiUrl(path), { headers })
  const body = await readJson(response)

  if (!response.ok) {
    const error = isErrorResponse(body)
      ? body.error
      : {
          code: `HTTP_${response.status}`,
          message: response.statusText || `Request failed with status ${response.status}`,
          fieldErrors: null,
        }
    throw new ApiRequestError(error, response.status)
  }

  return { response, body }
}

async function request<T>(path: string): Promise<T> {
  const { response, body } = await fetchJson(path)
  if (isErrorResponse(body)) throw new ApiRequestError(body.error, response.status)
  if (!isApiResponse<T>(body)) {
    throw new ApiRequestError(
      { code: 'INVALID_RESPONSE', message: '서버 응답 형식이 올바르지 않습니다.', fieldErrors: null },
      response.status,
    )
  }
  return body.data
}

function mockWritingId(id: unknown): number {
  const match = /^post-child-\d+-(\d+)$/.exec(String(id))
  if (!match) {
    throw new ApiRequestError(
      { code: 'INVALID_MOCK_ID', message: '목 글 ID가 올바르지 않습니다.', fieldErrors: null },
      200,
    )
  }
  return Number(match[1])
}

function mockPostId(writingId: number) {
  return `post-${DEV_CHILD_ID}-${writingId}`
}

function mockInputType(mode: unknown): WritingInputType {
  return mode === 'pen' ? 'PEN' : 'KEYBOARD'
}

function mapMockPost(value: unknown): WritingSummaryResponse {
  if (!isRecord(value)) {
    throw new ApiRequestError(
      { code: 'INVALID_MOCK_RESPONSE', message: '목 응답 형식이 올바르지 않습니다.', fieldErrors: null },
      200,
    )
  }
  const errorCount = typeof value.errorCount === 'number' ? value.errorCount : 0
  return {
    writingId: mockWritingId(value.id),
    inputType: mockInputType(value.mode),
    status: errorCount > 0 ? 'ANALYZED' : 'CONFIRMED',
    topic: String(value.title ?? ''),
    preview: String(value.content ?? ''),
    createdAt: String(value.createdAt ?? ''),
    submittedAt: null,
  }
}

function mapMockDetail(value: unknown): WritingDetailResponse {
  const post = mapMockPost(value)
  if (!isRecord(value)) {
    throw new ApiRequestError(
      { code: 'INVALID_MOCK_RESPONSE', message: '목 응답 형식이 올바르지 않습니다.', fieldErrors: null },
      200,
    )
  }
  const content = String(value.content ?? '')
  return {
    writingId: post.writingId,
    profileId: DEV_CHILD_PROFILE_ID,
    inputType: post.inputType,
    status: post.status,
    topic: post.topic,
    originalText: content,
    finalText: content,
    createdAt: post.createdAt,
    submittedAt: null,
  }
}

function mapMockError(value: unknown, index: number): ErrorCandidateResponse {
  if (!isRecord(value)) {
    throw new ApiRequestError(
      { code: 'INVALID_MOCK_RESPONSE', message: '목 응답 형식이 올바르지 않습니다.', fieldErrors: null },
      200,
    )
  }
  return {
    errorType: 'SPELLING',
    errorTypeLabel: String(value.type ?? '오류'),
    startIndex: index,
    endIndex: index + 1,
    originalText: String(value.original ?? ''),
    suggestion: String(value.suggestion ?? ''),
    confidence: typeof value.confidence === 'number' ? value.confidence : 0,
    reason: null,
  }
}

async function getMockJson<T>(path: string): Promise<T> {
  const { body } = await fetchJson(path)
  return body as T
}

export async function getWritings(options: { page?: number; size?: number } = {}): Promise<PageResponse<WritingSummaryResponse>> {
  const page = options.page ?? 0
  const size = options.size ?? 5

  if (USE_REAL_API) {
    return request<PageResponse<WritingSummaryResponse>>(`/api/writings?page=${page}&size=${size}`)
  }

  const posts = await getMockJson<unknown[]>(`/api/children/${DEV_CHILD_ID}/posts`)
  const allContent = posts.map(mapMockPost)
  const content = allContent.slice(page * size, page * size + size)
  return {
    content,
    page,
    size,
    totalElements: allContent.length,
    totalPages: Math.ceil(allContent.length / size),
    last: page >= Math.ceil(allContent.length / size) - 1,
  }
}

export async function getWriting(writingId: number): Promise<WritingDetailResponse> {
  if (USE_REAL_API) return request<WritingDetailResponse>(`/api/writings/${writingId}`)
  return mapMockDetail(await getMockJson<unknown>(`/api/posts/${mockPostId(writingId)}`))
}

export async function getWritingErrors(writingId: number): Promise<WritingErrorsResponse> {
  if (USE_REAL_API) return request<WritingErrorsResponse>(`/api/writings/${writingId}/errors`)

  const errors = await getMockJson<unknown[]>(`/api/posts/${mockPostId(writingId)}/errors`)
  return {
    writingId,
    status: 'SUCCEEDED',
    analyzedText: null,
    errors: errors.map(mapMockError),
    analyzedAt: null,
    failureReason: null,
  }
}
