import { next } from '@vercel/functions'

// Vercel Password Protection 은 Pro 플랜 전용이라 Hobby 에서 쓸 수 없다. 개인 dev
// 백엔드(인증 없음, 이제 실제 AI 과금 발생)에 연결된 배포를 아무나 못 열게 이 Basic Auth
// 게이트로 대신한다. BASIC_AUTH_USER / BASIC_AUTH_PASSWORD 를 Vercel 환경변수로 설정한다.
// 값이 비어 있으면 자격증명이 항상 불일치해 전체가 잠긴다 — 열려버리는 쪽이 아니라
// 닫히는 쪽으로 실패한다.
export default function middleware(request: Request) {
  const expected = `Basic ${btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`)}`
  if (request.headers.get('authorization') !== expected) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="WriteGrow"' },
    })
  }
  return next()
}
