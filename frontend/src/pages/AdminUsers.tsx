import { useEffect, useMemo, useState } from 'react'
import { UsersAPI } from '../lib/api'
import type { Role, User } from '../types'
import {
  Users, UserPlus, Mail, User as UserIcon, Briefcase, Shield,
  Loader2, AlertCircle, Send, CheckCircle2
} from 'lucide-react'

export default function AdminUsers() {
  const [rows, setRows] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  // new user form
  const [nName, setNName] = useState('')
  const [nEmail, setNEmail] = useState('')
  const [nRole, setNRole] = useState<Role>('employee')
  const [nManagerId, setNManagerId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  // row action loading (per user)
  const [busyUserId, setBusyUserId] = useState<number | null>(null)

  const managers = useMemo(() => rows.filter(r => r.role === 'manager'), [rows])

  async function load() {
    setLoading(true); setErr(''); setOk('')
    try {
      const list = await UsersAPI.list()
      setRows(list)
    } catch (e: any) {
      setErr(e?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function validateEmail(v: string) {
    return /\S+@\S+\.\S+/.test(v)
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setOk('')
    if (!nEmail || !validateEmail(nEmail)) return setErr('Enter a valid email')
    setCreating(true)
    try {
      const res = await UsersAPI.create({
        name: nName || undefined,
        email: nEmail.trim(),
         role: nRole as 'employee' | 'manager',
        managerId: nRole === 'employee' ? nManagerId : null,
      })
      setOk(res.emailSent ? 'User created and temp password emailed.' : 'User created.')
      // reset form
      setNName(''); setNEmail(''); setNRole('employee'); setNManagerId(null)
      await load()
    } catch (e: any) {
      setErr(e?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  async function changeRole(u: User, role: Role) {
    setErr(''); setOk(''); setBusyUserId(u.id)
    try {
      const patch: Partial<Pick<User, 'role' | 'managerId'>> = { role }
      if (role !== 'employee') patch.managerId = null // managers/admins shouldn't have a manager
      const updated = await UsersAPI.update(u.id, patch)
      setRows(prev => prev.map(r => (r.id === u.id ? { ...r, ...updated } : r)))
      setOk(`Updated ${u.email} → ${role}`)
    } catch (e: any) {
      setErr(e?.message || 'Failed to update role')
    } finally {
      setBusyUserId(null)
    }
  }

  async function changeManager(u: User, managerId: number | null) {
    setErr(''); setOk(''); setBusyUserId(u.id)
    try {
      const updated = await UsersAPI.update(u.id, { managerId })
      setRows(prev => prev.map(r => (r.id === u.id ? { ...r, ...updated } : r)))
      setOk(`Updated ${u.email}'s manager`)
    } catch (e: any) {
      setErr(e?.message || 'Failed to update manager')
    } finally {
      setBusyUserId(null)
    }
  }

  async function resend(u: User) {
    setErr(''); setOk(''); setBusyUserId(u.id)
    try {
      await UsersAPI.sendPassword(u.id)
      setOk(`Temp password re-sent to ${u.email}`)
    } catch (e: any) {
      setErr(e?.message || 'Failed to send password email')
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Users</h1>
            </div>
            <p className="text-sm text-gray-600">Create and manage employees, managers, and their relationships</p>
          </div>

          {/* banners */}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">{err}</div>
            </div>
          )}
          {ok && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="text-sm text-emerald-800">{ok}</div>
            </div>
          )}

          {/* add user form */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5" />
                <h2 className="text-lg font-bold">Add New User</h2>
              </div>
            </div>

            <form onSubmit={createUser} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="block w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-sm"
                      value={nName}
                      onChange={e => setNName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="block w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-sm"
                      value={nEmail}
                      onChange={e => setNEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Role</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Briefcase className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <select
                      id="role"
                      className="block w-full pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 text-sm appearance-none"
                      value={nRole}
                      onChange={e => {
                        const r = e.target.value as Role
                        setNRole(r)
                        if (r !== 'employee') setNManagerId(null)
                      }}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                {/* Manager (only for employee) */}
                <div className="space-y-2">
                  <label htmlFor="manager" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Manager</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Shield className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <select
                      id="manager"
                      disabled={nRole !== 'employee'}
                      className="block w-full pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 text-sm appearance-none disabled:opacity-50"
                      value={String(nManagerId ?? '')}
                      onChange={e => setNManagerId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Optional</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name || m.email}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-transparent uppercase tracking-wide select-none">Action</label>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>{creating ? 'Creating…' : 'Add User'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Users table */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3 text-indigo-600">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="font-medium">Loading users…</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No users yet. Add your first user above!
                      </td>
                    </tr>
                  ) : (
                    rows.map(u => (
                      <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {(u.name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{u.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 break-all">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                            value={u.role}
                            onChange={e => changeRole(u, e.target.value as Role)}
                            disabled={busyUserId === u.id}
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin" disabled>Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                            value={String(u.managerId ?? '')}
                            onChange={e => changeManager(u, e.target.value ? Number(e.target.value) : null)}
                            disabled={u.role !== 'employee' || busyUserId === u.id}
                          >
                            <option value="">—</option>
                            {managers.map(m => (
                              <option key={m.id} value={m.id}>{m.name || m.email}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => resend(u)}
                            disabled={busyUserId === u.id}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-60"
                          >
                            {busyUserId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Send Password</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </>
  )
}
