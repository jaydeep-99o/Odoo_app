import { useEffect, useMemo, useState } from 'react'
import { FlowAPI, UsersAPI } from '../lib/api'
import type { ApprovalFlow, User } from '../types'

export default function AdminFlows() {
  const [flow, setFlow] = useState<ApprovalFlow | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [saving, setSaving] = useState(false)
  const managersAndAdmins = useMemo(() => users.filter(u => u.role !== 'employee'), [users])

  useEffect(() => {
    UsersAPI.list().then(setUsers).catch(()=>{})
    FlowAPI.get().then(setFlow).catch(()=>{})
  }, [])

  function toggleApprover(uid: number) {
    if (!flow) return
    const exists = flow.approvers.find(a => a.userId === uid)
    const next = exists
      ? flow.approvers.filter(a => a.userId !== uid)
      : [...flow.approvers, { userId: uid, required: true }]
    setFlow({ ...flow, approvers: next })
  }
  function setReq(uid: number, required: boolean) {
    if (!flow) return
    setFlow({ ...flow, approvers: flow.approvers.map(a => a.userId === uid ? { ...a, required } : a) })
  }

  async function save() {
    if (!flow) return
    setSaving(true)
    try { const res = await FlowAPI.put(flow); setFlow(res) } finally { setSaving(false) }
  }

  if (!flow) return <div className="p-6">Loading…</div>

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">Approval rules</h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 grid gap-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={flow.isManagerFirst} onChange={e=>setFlow({ ...flow, isManagerFirst: e.target.checked })} />
          <span>Manager is an approver</span>
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={flow.sequenceEnabled} onChange={e=>setFlow({ ...flow, sequenceEnabled: e.target.checked })} />
          <span>Use sequence of approvers (Step 2, Step 3…)</span>
        </label>

        <div>
          <div className="text-sm font-medium mb-2">Approvers</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {managersAndAdmins.map(u => {
              const picked = flow.approvers.find(a => a.userId === u.id)
              return (
                <div key={u.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!picked} onChange={()=>toggleApprover(u.id)} />
                    <span>{u.name || u.email} <span className="text-xs text-gray-500">({u.role})</span></span>
                  </label>
                  <div className="text-xs flex items-center gap-2">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" disabled={!picked} checked={!!picked?.required} onChange={e=>setReq(u.id, e.target.checked)} />
                      <span>Required</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">When sequence is enabled, the order is the list order above (top → bottom).</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span>Percent threshold (optional)</span>
            <input className="border rounded-xl px-3 py-2" type="number" min={1} max={100} placeholder="60"
              value={flow.percentThreshold ?? ''} onChange={e=>setFlow({ ...flow, percentThreshold: e.target.value ? Number(e.target.value) : undefined })} />
            <span className="text-xs text-gray-500">If set, expense is approved when ≥ this % of approvers approve.</span>
          </label>

          <label className="grid gap-1 text-sm">
            <span>Specific approver (optional)</span>
            <select className="border rounded-xl px-3 py-2" value={String(flow.specificApproverId ?? '')}
              onChange={e=>setFlow({ ...flow, specificApproverId: e.target.value ? Number(e.target.value) : undefined })}>
              <option value="">—</option>
              {managersAndAdmins.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
            </select>
            <span className="text-xs text-gray-500">If this user approves, expense auto-approves (hybrid rule supported).</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 text-white px-4 py-2">{saving ? 'Saving…' : 'Save rules'}</button>
          <button onClick={()=>window.location.reload()} className="rounded-xl border px-4 py-2">Cancel</button>
        </div>
      </div>
    </div>
  )
}
