export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiErrorBody {
  code: string
  message: string
  fieldErrors: Record<string, string[]> | null
}

export interface ErrorResponse {
  success: false
  error: ApiErrorBody
}

export type ApiEnvelope<T> = ApiResponse<T> | ErrorResponse

export type WritingInputType = 'PEN' | 'KEYBOARD'

export type WritingStatus = 'DRAFT' | 'SUBMITTED' | 'ANALYZED' | 'CONFIRMED' | 'ANALYSIS_FAILED'

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface WritingSummaryResponse {
  writingId: number
  inputType: WritingInputType
  status: WritingStatus
  topic: string
  preview: string
  createdAt: string
  submittedAt?: string | null
}

export interface WritingCreateResponse {
  writingId: number
  inputType: WritingInputType
  status: WritingStatus
}

export interface WritingSubmitResponse {
  writingId: number
  status: WritingStatus
  analysisInProgress?: boolean
}

export interface StrokePoint {
  x: number
  y: number
  t: number
  pressure: number | null
}

export interface StrokeData {
  index: number
  penDownAt: number
  penUpAt: number
  points: StrokePoint[]
}

export interface StrokeBatchAppendResponse {
  writingId: number
  batchSeq: number
  strokeCount: number
  totalBatches: number
  duplicated: boolean
}

export interface HandwritingImageUploadResponse {
  writingId: number
  imageUrl: string
}

export interface OcrSegmentResponse {
  seq: number
  text: string
  confidence: number
  startIndex: number
  endIndex: number
  lowConfidence: boolean
}

export interface ProcessMetricResponse {
  totalDurationMs: number
  pauseCount: number
  longestPauseMs: number
  avgStrokeDurationMs: number
  hesitationPoints: Array<{
    charIndex: number
    character: string
    jamo: string
    durationMs: number
    retryCount: number
  }>
}

export interface HandwritingSummaryResponse {
  imageUrl: string
  strokeDataUrl: string
  strokeCount: number
  totalDurationMs: number
  canvasWidth: number
  canvasHeight: number
}

export interface AnalysisResponse {
  writingId: number
  status: WritingAnalysisStatus
  fullText: string | null
  overallConfidence: number | null
  provider: string | null
  requestedAt: string | null
  completedAt: string | null
  failureReason: string | null
  segments: OcrSegmentResponse[]
  processMetric: ProcessMetricResponse | null
  handwriting: HandwritingSummaryResponse | null
}

export interface WritingTextConfirmResponse {
  writingId: number
  status: WritingStatus
  finalText: string
  edited: boolean
}

export interface WritingDetailResponse {
  writingId: number
  profileId: number
  inputType: WritingInputType
  status: WritingStatus
  topic: string
  originalText: string
  finalText: string | null
  createdAt: string
  submittedAt?: string | null
}

export type WritingErrorType =
  | 'SPELLING'
  | 'SPACING'
  | 'FINAL_CONSONANT'
  | 'PARTICLE_ENDING'
  | 'SENTENCE_STRUCTURE'
  | 'VOCABULARY'

export interface ErrorCandidateResponse {
  errorType: WritingErrorType
  errorTypeLabel: string
  startIndex: number
  endIndex: number
  originalText: string
  suggestion: string
  confidence: number
  reason: string | null
}

export type WritingAnalysisStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export interface WritingErrorsResponse {
  writingId: number
  status: WritingAnalysisStatus
  analyzedText: string | null
  errors: ErrorCandidateResponse[]
  analyzedAt: string | null
  failureReason: string | null
}
