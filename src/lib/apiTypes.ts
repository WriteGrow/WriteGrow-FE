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

export interface AccountResponse {
  id: number
  name: string
  createdAt: string
}

export interface AccountCreateRequest {
  name: string
}

export type ProfileRole = 'PARENTS' | 'CHILD'

export interface ProfileResponse {
  id: number
  accountId: number
  role: ProfileRole
  nickname: string
  birthYear: number
  consentConfirmed: boolean
}

export interface ProfileCreateRequest {
  role: ProfileRole
  nickname: string
  birthYear: number
}

export interface ParentHomeChildResponse {
  profileId: number
  nickname: string
  age: number
  weeklyWritingCount: number
  selfCorrectionCount: number
  writingStreakDays: number
  recentWritingId: number | null
  recentWritingPreview: string | null
  topErrorTypes: WritingErrorType[]
  weeklyErrorCount: number
  errorCountDelta: number
}

export interface ParentHomeResponse {
  accountId: number
  children: ParentHomeChildResponse[]
}

export type WeeklyFocusReason = 'MOST_REPEATED' | string

export interface WeeklyReportSummaryResponse {
  writingCount: number
  confirmedCount: number
  selfCorrectionCount: number
  selfCorrectionDelta: number
  confirmedErrorCount: number
  previousWeekErrorCount: number
  errorCountDelta: number
  repeatedErrorTypeCount: number
  reviewPendingCount: number
}

export interface WeeklyRepeatedErrorResponse {
  errorType: WritingErrorType
  label: string
  cumulativeCount: number
  weeklyCount: number
  lastOccurredOn: string
}

export interface WeeklyDailyTrendResponse {
  date: string
  writingCount: number
  sentenceCount: number
  errorCount: number
  selfCorrectionCount: number
}

export interface WeeklyNextFocusResponse {
  errorType: WritingErrorType
  label: string
  reason: WeeklyFocusReason
  basisValue: number
}

export interface WeeklyReportResponse {
  profileId: number
  nickname: string
  weekStart: string
  weekEnd: string
  hasWriting: boolean
  summary: WeeklyReportSummaryResponse
  repeatedErrors: WeeklyRepeatedErrorResponse[]
  dailyTrends: WeeklyDailyTrendResponse[]
  nextFocus: WeeklyNextFocusResponse | null
}

export type WritingRevisionSource = 'OCR' | 'CHILD_EDIT' | 'SYSTEM' | string

export interface WritingRevisionResponse {
  revisionNo: number
  content: string
  source: WritingRevisionSource
  createdAt: string
}

export interface ParentWritingDetailResponse {
  writingId: number
  profileId: number
  nickname: string
  topic: string
  inputType: WritingInputType
  status: WritingStatus
  createdAt: string
  submittedAt: string | null
  originalText: string
  finalText: string | null
  sentenceCount: number
  selfCorrectionCount: number
  revisions: WritingRevisionResponse[]
  confirmedErrors: ErrorCandidateResponse[]
  reviewPendingCount: number
}

export interface WritingErrorReviewResponse {
  writingId: number
  status: WritingAnalysisStatus
  analyzedText: string | null
  reviewCount: number
  confirmedCount: number
  reviewCandidates: ErrorCandidateResponse[]
  analyzedAt: string | null
}

export interface AggregatedErrorReviewCandidate extends ErrorCandidateResponse {
  writingId: number
  topic: string
  analyzedText: string | null
}

export interface AggregatedChildErrorReview {
  reviewCount: number
  confirmedCount: number
  candidates: AggregatedErrorReviewCandidate[]
}

export interface ChildErrorProfileItemResponse {
  errorType: WritingErrorType
  errorTypeLabel: string
  occurrenceCount: number
  correctionSuccessCount: number
  correctionRate: number
  lastOccurredOn: string
}

export interface ChildErrorProfileResponse {
  profileId: number
  items: ChildErrorProfileItemResponse[]
}
