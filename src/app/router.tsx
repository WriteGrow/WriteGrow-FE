import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RoleGuard } from './RoleGuard'
import { ChildLayout } from '../components/ui/ChildLayout'
import { ParentLayout } from '../components/ui/ParentLayout'
import { ChildHome } from '../features/writing/ChildHome'
import { WriteStart } from '../features/writing/WriteStart'
import { PenWrite } from '../features/writing/PenWrite'
import { OcrConfirm } from '../features/writing/OcrConfirm'
import { Analyzing } from '../features/writing/Analyzing'
import { Hint } from '../features/writing/Hint'
import { Result } from '../features/writing/Result'
import { PostList } from '../features/writing/PostList'
import { PostDetail } from '../features/writing/PostDetail'
import { ParentHome } from '../features/report/ParentHome'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/child" replace /> },
  {
    path: '/child',
    element: (
      <RoleGuard allow="child">
        <ChildLayout>
          <Outlet />
        </ChildLayout>
      </RoleGuard>
    ),
    children: [
      { index: true, element: <ChildHome /> },
      { path: 'write', element: <WriteStart /> },
      { path: 'write/pen', element: <PenWrite /> },
      { path: 'write/ocr', element: <OcrConfirm /> },
      { path: 'write/analyzing', element: <Analyzing /> },
      { path: 'write/hint', element: <Hint /> },
      { path: 'write/result', element: <Result /> },
      { path: 'posts', element: <PostList /> },
      { path: 'posts/:postId', element: <PostDetail /> },
    ],
  },
  {
    path: '/parent',
    element: (
      <RoleGuard allow="parent">
        <ParentLayout>
          <ParentHome />
        </ParentLayout>
      </RoleGuard>
    ),
  },
])
