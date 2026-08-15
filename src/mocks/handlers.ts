import { http, HttpResponse } from 'msw'
import {
  analyzePost,
  children,
  createPost,
  errorsByPost,
  findPostById,
  getOcrSample,
  postsByChild,
} from './seed'

export const handlers = [
  http.get('/api/children', () => {
    return HttpResponse.json(children)
  }),

  http.get('/api/children/:childId/posts', ({ params }) => {
    const { childId } = params
    return HttpResponse.json(postsByChild(String(childId)))
  }),

  http.post('/api/children/:childId/posts', async ({ params, request }) => {
    const { childId } = params
    const body = (await request.json()) as {
      topic: string
      mode: 'pen' | 'keyboard'
      content: string
    }
    const post = createPost({ childId: String(childId), ...body })
    return HttpResponse.json(post)
  }),

  http.get('/api/posts/:postId', ({ params }) => {
    const post = findPostById(String(params.postId))
    if (!post) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(post)
  }),

  http.post('/api/ocr', async ({ request }) => {
    const { strokeCount } = (await request.json()) as { strokeCount: number }
    return HttpResponse.json({ text: getOcrSample(strokeCount) })
  }),

  http.post('/api/posts/:postId/analyze', async ({ params, request }) => {
    const { postId } = params
    const { content } = (await request.json()) as { content: string }
    const found = analyzePost(String(postId), content)
    return HttpResponse.json(found)
  }),

  http.get('/api/children/:childId/report/weekly', ({ params }) => {
    const { childId } = params
    const childPosts = postsByChild(String(childId))
    const weekly = childPosts
      .slice(0, 7)
      .reverse()
      .map((post, i) => ({
        week: `${i + 1}주차`,
        errorCount: post.errorCount,
        lowConfidenceCount: post.lowConfidenceCount,
      }))
    return HttpResponse.json(weekly)
  }),

  http.get('/api/posts/:postId/errors', ({ params }) => {
    const { postId } = params
    return HttpResponse.json(errorsByPost(String(postId)))
  }),
]
