import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { confirmText, getAnalysis, isAnalysisPending, rewriteWriting } from '../../lib/api'
import type { AnalysisResponse } from '../../lib/apiTypes'
import { useWritingStore } from '../../stores/writingStore'

const ANALYSIS_POLL_INTERVAL_MS = 1000
const MAX_ANALYSIS_POLL_MS = 30_000

export function OcrConfirm() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const writingId = useWritingStore((s) => s.writingId)
  const setContent = useWritingStore((s) => s.setContent)
  const [editedText, setEditedText] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  const analysisQuery = useQuery<AnalysisResponse>({
    queryKey: ['writings', writingId, 'analysis'],
    queryFn: () => getAnalysis(writingId as number),
    enabled: writingId !== null,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'SUCCEEDED' || status === 'FAILED' || timedOut) return false
      return ANALYSIS_POLL_INTERVAL_MS
    },
    refetchIntervalInBackground: false,
  })

  // 분석 레코드가 아직 없어서 나는 404 는 실패가 아니라 "아직"이다. 폴링을 계속한다.
  const analysisNotReady = isAnalysisPending(analysisQuery.error)
  const analysisRequestFailed = analysisQuery.isError && !analysisNotReady

  const analysisStatus = analysisQuery.data?.status
  const analysisSettled = analysisStatus === 'SUCCEEDED' || analysisStatus === 'FAILED'

  // 분석이 끝나면 타이머를 걸지 않는다. 걸어 두면 아이가 변환 결과를 읽고 고치는
  // 동안 30초가 지나 성공한 화면이 실패 화면으로 덮인다.
  useEffect(() => {
    if (timedOut || analysisSettled) return
    const timeoutId = setTimeout(() => setTimedOut(true), MAX_ANALYSIS_POLL_MS)
    return () => clearTimeout(timeoutId)
  }, [timedOut, analysisSettled])

  const text = editedText ?? analysisQuery.data?.fullText ?? ''

  const confirmMutation = useMutation({
    mutationFn: () => confirmText(writingId as number, { content: text.trim() }),
    onSuccess: (result) => {
      setContent(result.finalText)
      navigate('/child/write/analyzing')
    },
  })

  const rewriteMutation = useMutation({
    mutationFn: () => rewriteWriting(writingId as number),
    onSuccess: () => {
      setContent('')
      navigate('/child/write/pen')
    },
  })

  if (!topic || mode !== 'pen' || writingId === null) {
    return <Navigate to="/child/write" replace />
  }

  // 성공한 분석은 어떤 경우에도 실패로 뒤집지 않는다.
  const analysisFailed =
    analysisStatus !== 'SUCCEEDED' &&
    (analysisStatus === 'FAILED' || timedOut || analysisRequestFailed)
  if (analysisFailed) {
    const reason =
      analysisQuery.data?.failureReason ??
      (analysisQuery.error instanceof Error ? analysisQuery.error.message : null) ??
      (timedOut ? '시간이 너무 오래 걸리고 있어요.' : null)
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-[16px] font-semibold text-black">글을 읽지 못했어요</h1>
        <p className="text-[14px] text-black/70">{reason ?? '잠시 후 다시 시도해 주세요.'}</p>
        <button
          type="button"
          onClick={() => {
            setTimedOut(false)
            setEditedText(null)
            void analysisQuery.refetch()
          }}
          disabled={analysisQuery.isFetching}
          className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (analysisQuery.data?.status !== 'SUCCEEDED') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-black/10 border-t-black" />
        <p className="text-[14px] text-black">손글씨를 읽고 있어요...</p>
      </div>
    )
  }

  const lowConfidenceSegments = analysisQuery.data.segments.filter((segment) => segment.lowConfidence)

  return (
    <div className="space-y-4">
      <h1 className="text-[16px] font-semibold text-black">이렇게 읽었어, 맞아?</h1>
      <p className="text-[14px] text-black/70">잘못 읽은 부분이 있으면 고쳐줘.</p>

      {lowConfidenceSegments.length > 0 && (
        <div className="rounded-[5px] border border-black/15 bg-black/5 p-3 text-[14px] text-black/70">
          <p>확신도가 낮은 부분은 오류로 정하지 않고 따로 안내할게.</p>
          <ul className="mt-2 list-disc pl-5">
            {lowConfidenceSegments.map((segment) => (
              <li key={`${segment.seq}-${segment.startIndex}`}>&ldquo;{segment.text}&rdquo;</li>
            ))}
          </ul>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setEditedText(e.target.value)}
        rows={6}
        className="w-full rounded-[5px] border border-black/15 p-4 text-[14px] outline-none focus:border-black"
      />

      {(confirmMutation.isError || rewriteMutation.isError) && (
        <p role="alert" className="text-[14px] text-red-700">
          {(
            confirmMutation.error instanceof Error
              ? confirmMutation.error
              : rewriteMutation.error instanceof Error
                ? rewriteMutation.error
                : null
          )?.message ?? '요청을 처리하지 못했어요.'}
        </p>
      )}

      <button
        type="button"
        onClick={() => confirmMutation.mutate()}
        disabled={!text.trim() || confirmMutation.isPending || rewriteMutation.isPending}
        className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
      >
        맞아, 다음으로
      </button>
      <button
        type="button"
        onClick={() => rewriteMutation.mutate()}
        disabled={confirmMutation.isPending || rewriteMutation.isPending}
        className="w-full rounded-[5px] border border-black/15 px-4 py-2.5 text-[14px] text-black/70 disabled:opacity-40"
      >
        다시 쓸게요
      </button>
    </div>
  )
}
