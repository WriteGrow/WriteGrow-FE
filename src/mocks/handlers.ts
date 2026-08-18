import { http, HttpResponse } from 'msw'
import {
  analyzePost,
  children,
  createPost,
  errorsByPost,
  findPostById,
  getOcrSample,
  parentHomeSummaries,
  parentPostById,
  parentReviewByChild,
  postsByChild,
  weeklyReportByChild,
} from './seed'

export const handlers = [
  http.get('/api/children', () => {
    return HttpResponse.json(children)
  }),

  http.get('/api/parent/home', () => {
    return HttpResponse.json(parentHomeSummaries)
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
    const report = weeklyReportByChild(String(params.childId))
    if (!report) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(report)
  }),

  http.get('/api/children/:childId/posts/:postId', ({ params }) => {
    const detail = parentPostById(String(params.postId))
    if (!detail || detail.childId !== String(params.childId)) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(detail)
  }),

  http.get('/api/children/:childId/review', ({ params }) => {
    const review = parentReviewByChild(String(params.childId))
    if (!review) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(review)
  }),

  http.get('/api/posts/:postId/errors', ({ params }) => {
    const { postId } = params
    return HttpResponse.json(errorsByPost(String(postId)))
  }),
]
