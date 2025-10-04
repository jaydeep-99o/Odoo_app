// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLogin from './pages/AuthLogin'
import AuthSignup from './pages/AuthSignup'
import ChangePassword from './pages/ChangePassword'
import { GuestOnly, RequireAuth, RequireRole } from './components/Protected'
import AdminHome from './pages/AdminHome' // <-- add this
import { getUser } from './lib/auth'

function ManagerHome(){ return <div className="p-6">Manager approvals</div> }
function EmployeeHome(){ return <div className="p-6">Employee expenses</div> }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><AuthLogin/></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><AuthSignup/></GuestOnly>} />
      <Route path="/change-password" element={<RequireAuth><ChangePassword/></RequireAuth>} />

      {/* role homes */}
      <Route path="/admin/*" element={<RequireRole roles={['admin']}><AdminHome/></RequireRole>} />
      <Route path="/approvals/*" element={<RequireRole roles={['manager']}><ManagerHome/></RequireRole>} />
      <Route path="/expenses/*" element={<RequireRole roles={['employee']}><EmployeeHome/></RequireRole>} />

      {/* default: send user to their role home */}
      <Route path="/" element={<RoleLanding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RoleLanding() {
  const u = getUser()
  if (!u) return <Navigate to="/login" replace />
  if (u.role === 'admin') return <Navigate to="/admin" replace />
  if (u.role === 'manager') return <Navigate to="/approvals" replace />
  return <Navigate to="/expenses" replace />
}
