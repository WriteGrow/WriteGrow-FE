import type { ParentHomeChildResponse, WritingErrorType } from '../../../lib/apiTypes'

const ERROR_TYPE_LABELS: Record<WritingErrorType, string> = {
  SPELLING: '맞춤법',
  SPACING: '띄어쓰기',
  FINAL_CONSONANT: '받침',
  PARTICLE_ENDING: '조사·어미',
  SENTENCE_STRUCTURE: '문장 구조',
  VOCABULARY: '어휘',
}

export function errorTypeLabel(type: WritingErrorType) {
  return ERROR_TYPE_LABELS[type] ?? type
}

export function errorTypeLabels(types: WritingErrorType[]) {
  return types.map(errorTypeLabel)
}

export type ParentHomeChild = ParentHomeChildResponse
