import { http, HttpResponse } from 'msw'
import { children, errorsByPost, parentHomeSummaries, postsByChild } from './seed'

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
