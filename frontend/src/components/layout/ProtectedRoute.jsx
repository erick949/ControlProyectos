import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ session, roles, children }) {
  if (!session) return <Navigate to="/login" replace />
  if (roles && !roles.includes(session.role)) return <Navigate to="/dashboard" replace />
  return children
}