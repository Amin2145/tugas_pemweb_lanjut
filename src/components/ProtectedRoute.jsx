import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const dashMap = { owner: '/dashboard/owner', admin: '/dashboard/admin', kasir: '/dashboard/kasir' }
    return <Navigate to={dashMap[user.role] || '/login'} replace />
  }

  return children
}
