import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RouteErrorBoundary } from '@/components/layout/RouteErrorBoundary'
import { RouteLoading } from '@/components/layout/RouteLoading'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/**
 * @param {React.ReactNode} element
 * @param {React.ReactNode} [fallback]
 */
function withSuspense(element, fallback = <RouteLoading />) {
  return <Suspense fallback={fallback}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />, <RouteLoading fullHeight />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: withSuspense(<DashboardPage />),
          },
        ],
      },
      {
        path: '*',
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
])
