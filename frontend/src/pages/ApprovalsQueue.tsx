import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'
import { ApprovalsAPI, ExpensesAPI } from '../lib/api'
import type { ApprovalTask, ExpenseDetail } from '../types'

export default function ApprovalsQueue() {
  const nav = useNavigate()
  const [rows, setRows] = useState<ApprovalTask[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState<ExpenseDetail | null>(null)
  const [comment, setComment] = useState('')

  async function load() {
    setErr('')
    try { setRows(await ApprovalsAPI.queue()) }
    catch (e: any) { setErr(e.message || 'Failed to load') }
  }
  useEffect(() => { load() }, [])

  // Close modal on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function viewExpense(task: ApprovalTask) {
    try { setOpen(await ExpensesAPI.get(task.expenseId)); setComment('') } catch {}
  }

  async function act(task: ApprovalTask, decision: 'approved' | 'rejected') {
    try {
      await ApprovalsAPI.decide(task.id, decision, comment.trim() || undefined)
      setRows(prev => prev.filter(r => r.id !== task.id))
      setOpen(null); setComment('')
    } catch (e: any) {
      alert(e.message || 'Action failed')
    }
  }

  function back() {
    if (window.history.length > 1) nav(-1)
    else nav('/login') // fallback so you’re never trapped
  }
  function logout() {
    clearToken()
    nav('/login', { replace: true })
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={back} className="text-sm underline">← Back</button>
        <h1 className="text-xl font-semibold">Approvals queue</h1>
        <button onClick={logout} className="text-sm underline text-red-600">Logout</button>
      </div>

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
              {t.amountCompanyCcy} {t.companyCurrency}
              <span className="text-xs"> (submitted in {t.submittedCurrency})</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={()=>viewExpense(t)} className="rounded-lg border px-3 py-1.5">View</button>
              <button onClick={()=>act(t,'approved')} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5">Approve</button>
              <button onClick={()=>act(t,'rejected')} className="rounded-lg bg-red-600 text-white px-3 py-1.5">Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over / modal */}
      {open && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50" onClick={()=>setOpen(null)}>
          <div className="w-full max-w-xl bg-white rounded-2xl p-4 shadow" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">Expense #{open.id}</div>
              <button onClick={()=>setOpen(null)} className="text-sm underline">Close</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
              <Field k="Employee" v={open.employeeId} />
              <Field k="Date" v={open.spendDate.slice(0,10)} />
              <Field k="Category" v={open.category} />
              <Field k="Amount" v={`${open.amount} ${open.currency} (${open.amountCompanyCcy} company)`} />
              <Field k="Description" v={open.description} wide />
              {open.remarks ? <Field k="Remarks" v={open.remarks} wide /> : null}
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">Timeline</div>
              <div className="space-y-1 text-sm max-h-40 overflow-auto">
                {open.timeline?.map((ev, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{new Date(ev.at).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{ev.decision}</span>
                    {ev.comment ? <span className="text-gray-700">{ev.comment}</span> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <textarea
                className="border rounded-xl px-3 py-2 text-sm"
                placeholder="Optional comment"
                value={comment}
                onChange={e=>setComment(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={()=>act({ id: 10000+open.id, expenseId: open.id } as any, 'approved')}
                  className="rounded-lg bg-emerald-600 text-white px-3 py-1.5"
                >
                  Approve
                </button>
                <button
                  onClick={()=>act({ id: 10000+open.id, expenseId: open.id } as any, 'rejected')}
                  className="rounded-lg bg-red-600 text-white px-3 py-1.5"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ k, v, wide }: { k: string; v: any; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <div className="text-xs text-gray-500">{k}</div>
      <div className="text-sm">{String(v)}</div>
    </div>
  )
}
