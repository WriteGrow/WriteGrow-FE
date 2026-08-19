import { create } from 'zustand'
import type { ErrorCandidateResponse } from '../lib/apiTypes'

export type WriteMode = 'pen' | 'keyboard'

interface WritingState {
  topic: string | null
  mode: WriteMode | null
  content: string
  writingId: number | null
  errors: ErrorCandidateResponse[]
  hintIndex: number
  hintLevel: number
  setTopic: (topic: string) => void
  setMode: (mode: WriteMode) => void
  setContent: (content: string) => void
  setWritingId: (writingId: number) => void
  setErrors: (errors: ErrorCandidateResponse[]) => void
  nextError: () => void
  bumpHintLevel: () => void
  reset: () => void
}

const initialState = {
  topic: null,
  mode: null,
  content: '',
  writingId: null,
  errors: [] as ErrorCandidateResponse[],
  hintIndex: 0,
  hintLevel: 0,
}

export const useWritingStore = create<WritingState>()((set) => ({
  ...initialState,
  setTopic: (topic) => set({ topic }),
  setMode: (mode) => set({ mode }),
  setContent: (content) => set({ content }),
  setWritingId: (writingId) => set({ writingId }),
  setErrors: (errors) => set({ errors }),
  nextError: () => set((s) => ({ hintIndex: s.hintIndex + 1, hintLevel: 0 })),
  bumpHintLevel: () => set((s) => ({ hintLevel: Math.min(s.hintLevel + 1, 2) })),
  reset: () => set(initialState),
}))
