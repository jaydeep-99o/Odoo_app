import { useEffect, useState } from 'react'
import { ApprovalsAPI } from '../lib/api'
import type { ApprovalTask } from '../types'

export default function ApprovalsQueue() {
  const [rows, setRows] = useState<ApprovalTask[]>([])
  const [err, setErr] = useState('')

  async function load() {
    setErr('')
    try { setRows(await ApprovalsAPI.queue()) }
    catch (e: any) { setErr(e.message || 'Failed to load') }
  }
  useEffect(() => { load() }, [])

  async function act(task: ApprovalTask, decision: 'approved' | 'rejected', comment?: string) {
    try {
      await ApprovalsAPI.decide(task.id, decision, comment)
      setRows(prev => prev.filter(r => r.id !== task.id))
    } catch (e: any) {
      alert(e.message || 'Action failed')
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">Approvals queue</h1>
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
      {rows.length === 0 ? <div className="text-sm text-gray-600">No pending approvals.</div> : null}

      <div className="grid gap-3">
        {rows.map(t => (
          <div key={t.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t.ownerName}</div>
              <div className="text-sm">{t.category}</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t.amountCompanyCcy} {t.companyCurrency} <span className="text-xs">(submitted in {t.submittedCurrency})</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={()=>act(t,'approved')} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5">Approve</button>
              <button onClick={()=>act(t,'rejected')} className="rounded-lg bg-red-600 text-white px-3 py-1.5">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
