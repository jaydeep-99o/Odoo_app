import { useState } from 'react'
import { AuthAPI } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function ChangePassword() {
  const nav = useNavigate()
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState(''), [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setMsg('')
    if (newPassword !== confirm) return setErr('Passwords do not match')
    setLoading(true)
    try {
      // ⬇️ only two arguments now
      await AuthAPI.changePassword(currentPassword, newPassword)
      localStorage.removeItem('reset_required')
      setMsg('Password updated. Redirecting…')
      setTimeout(() => nav('/'), 600)
    } catch (e: any) {
      setErr(e.message || 'Could not change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="bg-white rounded-2xl p-8 w-full max-w-md shadow grid gap-3">
        <h1 className="text-2xl font-bold">Change Password</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="text-sm text-green-700">{msg}</div>}

        <label className="grid gap-1 text-sm"><span>Current (temporary) password</span>
          <input type="password" className="border rounded-xl px-3 py-2" value={currentPassword} onChange={e=>setCurrent(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm"><span>New password</span>
          <input type="password" className="border rounded-xl px-3 py-2" value={newPassword} onChange={e=>setNew(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm"><span>Confirm new password</span>
          <input type="password" className="border rounded-xl px-3 py-2" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        </label>

        <button disabled={loading} className="rounded-xl bg-blue-600 text-white px-4 py-2">
          {loading ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </div>
  )
}
