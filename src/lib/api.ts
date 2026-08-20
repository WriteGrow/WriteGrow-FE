import { getActiveChildProfileId } from '../stores/accountStore'
import type {
  AccountCreateRequest,
  AccountResponse,
  ApiErrorBody,
  AnalysisResponse,
  ErrorResponse,
  HandwritingImageUploadResponse,
  PageResponse,
  ParentHomeResponse,
  ProfileCreateRequest,
  ProfileResponse,
  StrokeBatchAppendResponse,
  StrokeData,
  WritingCreateResponse,
  WritingDetailResponse,
  WritingErrorsResponse,
  WritingInputType,
  WritingSubmitResponse,
  WritingTextConfirmResponse,
  WritingSummaryResponse,
} from './apiTypes'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')

/**
 * 분석 레코드가 아직 만들어지지 않았다는 뜻의 404.
 *
 * 제출은 트랜잭션 커밋 뒤 별도 스레드에서 분석을 시작한다(HandwritingSubmittedEvent,
 * TextConfirmedEvent). 그 스레드가 markProcessing 으로 레코드를 만들기 전에 폴링이
 * 들어가면 서버는 ANALYSIS_NOT_FOUND 404 를 준다. 실패가 아니라 "아직"이므로
 * 폴링을 계속해야 한다.
 */
export function isAnalysisPending(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 404 && error.code === 'ANALYSIS_NOT_FOUND'
}

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

async function fetchJson(
  path: string,
  init: RequestInit = {},
  profileId?: number,
): Promise<{ response: Response; body: unknown }> {
  const headers = new Headers(init.headers)
  const resolvedProfileId = profileId ?? getActiveChildProfileId()
  if (resolvedProfileId !== undefined) {
    headers.set('X-Profile-Id', String(resolvedProfileId))
  }
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(toApiUrl(path), { ...init, headers })
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

async function request<T>(path: string, init: RequestInit = {}, profileId?: number): Promise<T> {
  const { response, body } = await fetchJson(path, init, profileId)
  if (isErrorResponse(body)) throw new ApiRequestError(body.error, response.status)
  if (!isApiResponse<T>(body)) {
    throw new ApiRequestError(
      { code: 'INVALID_RESPONSE', message: 'Server response is not a valid API envelope.', fieldErrors: null },
      response.status,
    )
  }
  return body.data
}

export async function getWritings(options: { page?: number; size?: number } = {}): Promise<PageResponse<WritingSummaryResponse>> {
  const page = options.page ?? 0
  const size = options.size ?? 5
  return request<PageResponse<WritingSummaryResponse>>(`/api/writings?page=${page}&size=${size}`)
}

export async function getWriting(writingId: number): Promise<WritingDetailResponse> {
  return request<WritingDetailResponse>(`/api/writings/${writingId}`)
}

export async function getWritingErrors(writingId: number): Promise<WritingErrorsResponse> {
  return request<WritingErrorsResponse>(`/api/writings/${writingId}/errors`)
}

export async function createWriting(input: { inputType: WritingInputType; topic?: string }): Promise<WritingCreateResponse> {
  return request<WritingCreateResponse>('/api/writings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function submitWriting(
  writingId: number,
  input: { content?: string } = {},
): Promise<WritingSubmitResponse> {
  const body = input.content === undefined ? undefined : JSON.stringify({ content: input.content })
  return request<WritingSubmitResponse>(`/api/writings/${writingId}/submit`, {
    method: 'POST',
    ...(body === undefined ? {} : { body }),
  })
}

export async function appendStrokes(
  writingId: number,
  input: { batchSeq: number; strokes: StrokeData[] },
): Promise<StrokeBatchAppendResponse> {
  return request<StrokeBatchAppendResponse>(`/api/writings/${writingId}/strokes`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function uploadHandwritingImage(
  writingId: number,
  blob: Blob,
  dimensions: { canvasWidth: number; canvasHeight: number },
): Promise<HandwritingImageUploadResponse> {
  const formData = new FormData()
  formData.append('file', blob, 'handwriting.png')
  const query = new URLSearchParams({
    canvasWidth: String(dimensions.canvasWidth),
    canvasHeight: String(dimensions.canvasHeight),
  })
  return request<HandwritingImageUploadResponse>(`/api/writings/${writingId}/handwriting-image?${query}`, {
    method: 'POST',
    body: formData,
  })
}

export async function getAnalysis(writingId: number): Promise<AnalysisResponse> {
  return request<AnalysisResponse>(`/api/writings/${writingId}/analysis`)
}

export async function confirmText(
  writingId: number,
  input: { content: string },
): Promise<WritingTextConfirmResponse> {
  return request<WritingTextConfirmResponse>(`/api/writings/${writingId}/text`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function rewriteWriting(writingId: number): Promise<WritingCreateResponse> {
  return request<WritingCreateResponse>(`/api/writings/${writingId}/rewrite`, {
    method: 'POST',
  })
}

export async function createAccount(input: AccountCreateRequest): Promise<AccountResponse> {
  return request<AccountResponse>('/api/accounts', { method: 'POST', body: JSON.stringify(input) })
}

export async function createProfile(accountId: number, input: ProfileCreateRequest): Promise<ProfileResponse> {
  return request<ProfileResponse>(`/api/accounts/${accountId}/profiles`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getParentHome(parentProfileId: number): Promise<ParentHomeResponse> {
  return request<ParentHomeResponse>('/api/parents/home', {}, parentProfileId)
}
