/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants'

export default function ProtectedRoute({ user }) {
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
