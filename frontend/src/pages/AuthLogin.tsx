import { useState } from 'react'
import { AuthAPI } from '../lib/api'
import { setToken, setUser } from '../lib/auth'
import { Link, useNavigate } from 'react-router-dom'

const nextByRole: Record<string, string> = {
  admin: '/admin/users',
  manager: '/approvals',
  employee: '/expenses',
}

export default function AuthLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@hack.co')
  const [password, setPassword] = useState('password')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingForgot, setSendingForgot] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setLoading(true)
    try {
      const res = await AuthAPI.login(email, password)
      setToken(res.token)
      setUser?.(res.user) // safe if you added setUser; otherwise remove this line
      if (res.resetRequired) {
        localStorage.setItem('reset_required', '1')
        nav('/change-password')
      } else {
        localStorage.removeItem('reset_required')
        nav(nextByRole[res.user.role] || '/')
      }
    } catch (e: any) {
      setErr(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function forgot(e?: React.MouseEvent<HTMLButtonElement>) {
    // ensure it never submits the form
    e?.preventDefault()
    e?.stopPropagation()

    setErr('')
    setMsg('')
    setSendingForgot(true)
    try {
      await AuthAPI.forgot(email) // handles 200 or 204
      setMsg('If the email exists, a temporary password has been sent.')
    } catch (e: any) {
      setErr(e?.message || 'Could not send email. Check the address and try again.')
    } finally {
      setSendingForgot(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="bg-white rounded-2xl p-8 w-full max-w-md shadow grid gap-3">
        <h1 className="text-2xl font-bold">Signin</h1>

        {err && <div className="text-sm text-red-600" role="alert">{err}</div>}
        {msg && <div className="text-sm text-green-700" aria-live="polite">{msg}</div>}

        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input
            className="border rounded-xl px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Password</span>
          <input
            type="password"
            className="border rounded-xl px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button
          disabled={loading}
          className="rounded-xl bg-blue-600 text-white px-4 py-2"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <div className="text-sm flex items-center justify-between">
          <Link to="/signup" className="text-blue-600">Don’t have an account? Signup</Link>

          {/* IMPORTANT: make it an explicit button so it never submits the form */}
          <button
            type="button"
            onClick={forgot}
            disabled={sendingForgot}
            aria-busy={sendingForgot}
            className="text-blue-600 underline disabled:opacity-60"
          >
            {sendingForgot ? 'Sending…' : 'Forgot password?'}
          </button>
        </div>
      </form>
    </div>
  )
}
