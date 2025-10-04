import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../lib/auth'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export function RequireRole({ roles, children }: { roles: Array<'admin'|'manager'|'employee'>; children: JSX.Element }) {
  const token = getToken(); const user = getUser()
  if (!token) return <Navigate to="/login" replace />
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export function GuestOnly({ children }: { children: JSX.Element }) {
  const token = getToken()
  return token ? <Navigate to="/" replace /> : children
}
