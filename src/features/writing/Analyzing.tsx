import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { createWriting, getWritingErrors, submitWriting } from '../../lib/api'
import type { WritingErrorsResponse } from '../../lib/apiTypes'
import { useWritingStore } from '../../stores/writingStore'

const ERROR_POLL_INTERVAL_MS = 1000
// 상한은 시간으로 잰다. 응답 횟수로 세면 요청이 계속 실패할 때 카운터가 올라가지 않아
// 상한이 영영 걸리지 않는다.
const MAX_ERROR_POLL_MS = 30_000

export function Analyzing() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const content = useWritingStore((s) => s.content)
  const writingId = useWritingStore((s) => s.writingId)
  const setWritingId = useWritingStore((s) => s.setWritingId)
  const setErrors = useWritingStore((s) => s.setErrors)
  const reset = useWritingStore((s) => s.reset)
  const [keyboardWritingId, setKeyboardWritingId] = useState<number | null>(null)
  const [pollDeadline, setPollDeadline] = useState<number | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  const createAndSubmit = useMutation({
    mutationFn: async () => {
      const created = await createWriting({
        inputType: mode === 'pen' ? 'PEN' : 'KEYBOARD',
        topic: topic ?? '',
      })
      setWritingId(created.writingId)
      await submitWriting(created.writingId, mode === 'keyboard' ? { content } : {})
      setKeyboardWritingId(created.writingId)
      setPollDeadline(Date.now() + MAX_ERROR_POLL_MS)
      return created.writingId
    },
  })

  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || !topic || !mode) return
    startedRef.current = true
    if (mode === 'pen') {
      return
    }
    if (!content) return
    createAndSubmit.mutate()
    // The mutation must start once when this route is entered, including under StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submittedWritingId = mode === 'pen' ? writingId : keyboardWritingId

  useEffect(() => {
    if (mode !== 'pen' || writingId === null || !content) return
    const timeoutId = setTimeout(() => setTimedOut(true), MAX_ERROR_POLL_MS)
    return () => clearTimeout(timeoutId)
  }, [mode, writingId, content])

  const errorsQuery = useQuery<WritingErrorsResponse>({
    queryKey: ['writings', submittedWritingId, 'errors', 'submit-flow'],
    queryFn: () => getWritingErrors(submittedWritingId as number),
    enabled: submittedWritingId !== null,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'SUCCEEDED' || status === 'FAILED' || timedOut) return false
      return ERROR_POLL_INTERVAL_MS
    },
    // 요청이 실패해도 폴링은 계속돼야 한다. 서버가 잠깐 흔들린 것일 수 있다.
    // 대신 아래 deadline 타이머가 30초 뒤에 반드시 끊는다.
    refetchIntervalInBackground: false,
  })

  // 마감 시각이 지나면 상태와 무관하게 폴링을 끊는다. 요청이 계속 실패해도 여기서 걸린다.
  useEffect(() => {
    if (pollDeadline === null || timedOut) return
    const remaining = Math.max(pollDeadline - Date.now(), 0)
    const id = setTimeout(() => setTimedOut(true), remaining)
    return () => clearTimeout(id)
  }, [pollDeadline, timedOut])

  useEffect(() => {
    const result = errorsQuery.data
    if (!result || result.status !== 'SUCCEEDED') return
    setErrors(result.errors)
    navigate(result.errors.length > 0 ? '/child/write/hint' : '/child/write/result', { replace: true })
  }, [errorsQuery.data, navigate, setErrors])

  // 세 가지를 모두 실패로 다뤄야 한다. 분석이 실패한 것(status FAILED), 시간이 초과된 것,
  // 그리고 요청 자체가 실패한 것(errorsQuery.isError). 마지막을 빠뜨리면 서버 장애 때
  // 아이가 빠져나갈 수 없는 스피너를 보게 된다.
  const analysisFailed = errorsQuery.data?.status === 'FAILED' || timedOut || errorsQuery.isError
  const requestFailed = createAndSubmit.isError

  function retryAnalysis() {
    if (submittedWritingId !== null) {
      setTimedOut(false)
      setPollDeadline(Date.now() + MAX_ERROR_POLL_MS)
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

  if (!topic || !mode || (mode === 'keyboard' && !content) || (mode === 'pen' && (writingId === null || !content))) {
    return <Navigate to="/child/write" replace />
  }

  if (analysisFailed || requestFailed) {
    const reason =
      errorsQuery.data?.failureReason ??
      createAndSubmit.error?.message ??
      (errorsQuery.error instanceof Error ? errorsQuery.error.message : null) ??
      (timedOut ? '시간이 너무 오래 걸리고 있어요.' : null)
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
      <p className="text-[14px] text-black">
        {mode === 'pen' ? '글의 오류를 분석하고 있어요...' : '글을 저장하고 오류를 분석하고 있어요...'}
      </p>
    </div>
  )
}
