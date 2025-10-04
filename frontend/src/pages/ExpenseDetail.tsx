import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExpensesAPI } from '../lib/api'
import type { ExpenseDetail } from '../types'

export default function ExpenseDetail() {
  const { id } = useParams()
  const [exp, setExp] = useState<ExpenseDetail | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!id) return
    ExpensesAPI.get(Number(id)).then(setExp).catch(e => setErr(e.message || 'Failed to load'))
  }, [id])

  if (err) return <div className="p-6 text-red-600">{err}</div>
  if (!exp) return <div className="p-6">Loading…</div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Expense #{exp.id}</h1>
        <Link to={-1 as any} className="text-sm underline">Back</Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 grid sm:grid-cols-2 gap-3">
        <Field k="Date" v={exp.spendDate.slice(0,10)} />
        <Field k="Category" v={exp.category} />
        <Field k="Amount" v={`${exp.amount} ${exp.currency}`} />
        <Field k="Company amount" v={`${exp.amountCompanyCcy}`} />
        <Field k="Status" v={exp.status} />
        <Field k="Description" v={exp.description} wide />
        {exp.remarks ? <Field k="Remarks" v={exp.remarks} wide /> : null}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-medium mb-2">Timeline</div>
        <div className="space-y-1 text-sm">
          {exp.timeline?.map((ev, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{new Date(ev.at).toLocaleString()}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{ev.decision}</span>
              {ev.comment ? <span className="text-gray-700">{ev.comment}</span> : null}
            </div>
          ))}
        </div>
      </div>
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
