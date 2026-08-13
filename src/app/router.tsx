import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RoleGuard } from './RoleGuard'
import { ChildLayout } from '../components/ui/ChildLayout'
import { ParentLayout } from '../components/ui/ParentLayout'
import { ChildHome } from '../features/writing/ChildHome'
import { ParentHome } from '../features/report/ParentHome'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/child" replace /> },
  {
    path: '/child',
    element: (
      <RoleGuard allow="child">
        <ChildLayout>
          <ChildHome />
        </ChildLayout>
      </RoleGuard>
    ),
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
