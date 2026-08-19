import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { createWriting, getWritingErrors, submitWriting } from '../../lib/api'
import type { WritingErrorsResponse } from '../../lib/apiTypes'
import { useWritingStore } from '../../stores/writingStore'

const ERROR_POLL_INTERVAL_MS = 1000
const MAX_ERROR_POLLS = 30

export function Analyzing() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const content = useWritingStore((s) => s.content)
  const setWritingId = useWritingStore((s) => s.setWritingId)
  const setErrors = useWritingStore((s) => s.setErrors)
  const reset = useWritingStore((s) => s.reset)
  const [submittedWritingId, setSubmittedWritingId] = useState<number | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const lastDataUpdatedAt = useRef(0)

  const createAndSubmit = useMutation({
    mutationFn: async () => {
      const created = await createWriting({
        inputType: mode === 'pen' ? 'PEN' : 'KEYBOARD',
        topic: topic ?? '',
      })
      setWritingId(created.writingId)
      await submitWriting(created.writingId, mode === 'keyboard' ? { content } : {})
      setSubmittedWritingId(created.writingId)
      return created.writingId
    },
  })

  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || !topic || !mode || !content) return
    startedRef.current = true
    createAndSubmit.mutate()
    // The mutation must start once when this route is entered, including under StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const errorsQuery = useQuery<WritingErrorsResponse>({
    queryKey: ['writings', submittedWritingId, 'errors', 'submit-flow'],
    queryFn: () => getWritingErrors(submittedWritingId as number),
    enabled: submittedWritingId !== null,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'SUCCEEDED' || status === 'FAILED' || pollCount >= MAX_ERROR_POLLS) return false
      return ERROR_POLL_INTERVAL_MS
    },
  })

  useEffect(() => {
    if (!errorsQuery.dataUpdatedAt || errorsQuery.dataUpdatedAt === lastDataUpdatedAt.current) return
    lastDataUpdatedAt.current = errorsQuery.dataUpdatedAt
    setPollCount((count) => count + 1)
  }, [errorsQuery.dataUpdatedAt])

  useEffect(() => {
    const result = errorsQuery.data
    if (!result || result.status !== 'SUCCEEDED') return
    setErrors(result.errors)
    navigate(result.errors.length > 0 ? '/child/write/hint' : '/child/write/result', { replace: true })
  }, [errorsQuery.data, navigate, setErrors])

  const timedOut = pollCount >= MAX_ERROR_POLLS && errorsQuery.data?.status !== 'SUCCEEDED' && errorsQuery.data?.status !== 'FAILED'
  const analysisFailed = errorsQuery.data?.status === 'FAILED' || timedOut
  const requestFailed = createAndSubmit.isError

  function retryAnalysis() {
    if (submittedWritingId !== null) {
      setPollCount(0)
      lastDataUpdatedAt.current = 0
      void errorsQuery.refetch()
      return
    }
    createAndSubmit.reset()
    createAndSubmit.mutate()
  }

  function goHome() {
    reset()
    navigate('/child')
  }

  if (!topic || !mode || !content) {
    return <Navigate to="/child/write" replace />
  }

  if (analysisFailed || requestFailed) {
    const reason = errorsQuery.data?.failureReason ?? createAndSubmit.error?.message
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-[16px] font-semibold text-black">분석에 실패했어요</h1>
        <p className="text-[14px] text-black/70">{reason ?? '잠시 후 다시 시도해 주세요.'}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={retryAnalysis}
            disabled={errorsQuery.isFetching || createAndSubmit.isPending}
            className="flex-1 rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={goHome}
            className="flex-1 rounded-[5px] border border-black/20 px-4 py-2.5 text-[14px] font-semibold text-black hover:bg-black/5"
          >
            홈으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="size-12 animate-spin rounded-full border-4 border-black/10 border-t-black" />
      <p className="text-[14px] text-black">글을 저장하고 오류를 분석하고 있어요...</p>
    </div>
  )
}
