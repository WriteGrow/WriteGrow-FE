import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { DEV_CHILD_ID } from '../../lib/devChild'
import type { ErrorItem, Post } from '../../mocks/seed'
import { useWritingStore } from '../../stores/writingStore'

export function Analyzing() {
  const navigate = useNavigate()
  const topic = useWritingStore((s) => s.topic)
  const mode = useWritingStore((s) => s.mode)
  const content = useWritingStore((s) => s.content)
  const setPostId = useWritingStore((s) => s.setPostId)
  const setErrors = useWritingStore((s) => s.setErrors)

  const analyzeFlow = useMutation({
    mutationFn: async (): Promise<ErrorItem[]> => {
      const createRes = await fetch(`/api/children/${DEV_CHILD_ID}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mode, content }),
      })
      const post: Post = await createRes.json()
      setPostId(post.id)

      const analyzeRes = await fetch(`/api/posts/${post.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      return analyzeRes.json()
    },
    onSuccess: (foundErrors) => {
      setErrors(foundErrors)
      navigate(foundErrors.length > 0 ? '/child/write/hint' : '/child/write/result')
    },
  })

  useEffect(() => {
    if (topic && mode && content && analyzeFlow.isIdle) {
      analyzeFlow.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!topic || !mode || !content) {
    return <Navigate to="/child/write" replace />
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="size-12 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
      <p className="text-body">틀린 곳이 있는지 살펴보고 있어...</p>
    </div>
  )
}
