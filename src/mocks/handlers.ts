import { http, HttpResponse } from 'msw'
import {
  children,
  errorsByPost,
  parentHomeSummaries,
  parentPostById,
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

  http.get('/api/posts/:postId/errors', ({ params }) => {
    const { postId } = params
    return HttpResponse.json(errorsByPost(String(postId)))
  }),
]
