import { useEffect, useMemo, useState } from 'react'
import { UsersAPI } from '../lib/api'
import type { User, Role } from '../types'

export default function AdminUsers() {
  const [rows, setRows] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [nName, setNName] = useState('')
  const [nEmail, setNEmail] = useState('')
  const [nRole, setNRole] = useState<Role>('employee')
  const [nManagerId, setNManagerId] = useState<number | null>(null)
  const managers = useMemo(() => rows.filter(r => r.role === 'manager'), [rows])

  async function load() {
    setLoading(true); setErr('')
    try { setRows(await UsersAPI.list()) } catch (e: any) { setErr(e.message || 'Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      await UsersAPI.create({ name: nName, email: nEmail, role: nRole === 'admin' ? 'employee' : nRole, managerId: nManagerId })
      setNName(''); setNEmail(''); setNRole('employee'); setNManagerId(null)
      await load()
    } catch (e: any) { setErr(e.message || 'Create failed') }
  }

  async function changeRole(u: User, role: Role) {
    try { await UsersAPI.update(u.id, { role }); await load() } catch {}
  }
  async function changeManager(u: User, managerId: number | null) {
    try { await UsersAPI.update(u.id, { managerId }); await load() } catch {}
  }
  async function resend(u: User) {
    try { await UsersAPI.sendPassword(u.id); alert(`Temp password re-sent to ${u.email}`) } catch {}
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

      {/* New row */}
      <form onSubmit={createUser} className="rounded-xl border border-gray-200 bg-white p-3 grid sm:grid-cols-5 gap-2 mb-4">
        <input className="border rounded-lg px-3 py-2" placeholder="Name" value={nName} onChange={e=>setNName(e.target.value)} />
        <input className="border rounded-lg px-3 py-2" placeholder="Email" value={nEmail} onChange={e=>setNEmail(e.target.value)} />
        <select className="border rounded-lg px-3 py-2" value={nRole} onChange={e=>setNRole(e.target.value as Role)}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
        <select className="border rounded-lg px-3 py-2" value={String(nManagerId ?? '')} onChange={e=>setNManagerId(e.target.value? Number(e.target.value): null)}>
          <option value="">Manager (optional)</option>
          {managers.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
        </select>
        <button className="rounded-lg bg-blue-600 text-white px-4 py-2">Add user</button>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="text-left text-sm bg-gray-50">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Manager</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td className="p-3" colSpan={5}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-3" colSpan={5}>No users yet.</td></tr>
            ) : rows.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name || '—'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select className="border rounded-lg px-2 py-1" value={u.role} onChange={e=>changeRole(u, e.target.value as Role)}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin" disabled>Admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <select className="border rounded-lg px-2 py-1" value={String(u.managerId ?? '')} onChange={e=>changeManager(u, e.target.value ? Number(e.target.value) : null)}>
                    <option value="">—</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name || m.email}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <button onClick={()=>resend(u)} className="text-blue-600 underline">Send password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
