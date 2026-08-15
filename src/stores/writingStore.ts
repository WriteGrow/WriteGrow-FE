import { create } from 'zustand'
import type { ErrorItem } from '../mocks/seed'

export type WriteMode = 'pen' | 'keyboard'

interface WritingState {
  topic: string | null
  mode: WriteMode | null
  content: string
  postId: string | null
  errors: ErrorItem[]
  hintIndex: number
  hintLevel: number
  setTopic: (topic: string) => void
  setMode: (mode: WriteMode) => void
  setContent: (content: string) => void
  setPostId: (postId: string) => void
  setErrors: (errors: ErrorItem[]) => void
  nextError: () => void
  bumpHintLevel: () => void
  reset: () => void
}

const initialState = {
  topic: null,
  mode: null,
  content: '',
  postId: null,
  errors: [] as ErrorItem[],
  hintIndex: 0,
  hintLevel: 0,
}

export const useWritingStore = create<WritingState>()((set) => ({
  ...initialState,
  setTopic: (topic) => set({ topic }),
  setMode: (mode) => set({ mode }),
  setContent: (content) => set({ content }),
  setPostId: (postId) => set({ postId }),
  setErrors: (errors) => set({ errors }),
  nextError: () => set((s) => ({ hintIndex: s.hintIndex + 1, hintLevel: 0 })),
  bumpHintLevel: () => set((s) => ({ hintLevel: Math.min(s.hintLevel + 1, 2) })),
  reset: () => set(initialState),
}))
