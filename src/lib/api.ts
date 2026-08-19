import { DEV_CHILD_PROFILE_ID } from './devChild'
import type {
  ApiErrorBody,
  ErrorResponse,
  PageResponse,
  WritingCreateResponse,
  WritingDetailResponse,
  WritingErrorsResponse,
  WritingInputType,
  WritingSubmitResponse,
  WritingSummaryResponse,
} from './apiTypes'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')

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

async function fetchJson(path: string, init: RequestInit = {}): Promise<{ response: Response; body: unknown }> {
  const headers = new Headers(init.headers)
  headers.set('X-Profile-Id', String(DEV_CHILD_PROFILE_ID))
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { response, body } = await fetchJson(path, init)
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
  return request<WritingSubmitResponse>(`/api/writings/${writingId}/submit`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
