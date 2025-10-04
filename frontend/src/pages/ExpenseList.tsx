import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExpensesAPI } from '../lib/api'
import type { Expense, ExpenseStatus } from '../types'

export default function ExpenseList() {
  const [rows, setRows] = useState<Expense[]>([])
  const [tab, setTab] = useState<ExpenseStatus | 'all'>('all')

  useEffect(() => { ExpensesAPI.mine().then(setRows).catch(()=>{}) }, [])
  const filtered = useMemo(() => tab === 'all' ? rows : rows.filter(r => r.status === tab), [rows, tab])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">My expenses</h1>
        <Link to="/expenses/new" className="rounded-xl bg-blue-600 text-white px-4 py-2">New expense</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-sm mb-3">
        {(['all','draft','waiting','approved','rejected'] as const).map(k => (
          <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1.5 rounded-full border ${tab===k?'bg-gray-900 text-white border-gray-900':'border-gray-300'}`}>
            {k}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="text-left text-sm bg-gray-50">
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.length === 0 ? (
              <tr><td className="p-3" colSpan={5}>No expenses.</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.spendDate.slice(0,10)}</td>
                <td className="p-3">{e.description}</td>
                <td className="p-3">{e.category}</td>
                <td className="p-3">{e.amount} {e.currency} <span className="text-xs text-gray-500">({e.amountCompanyCcy} company)</span></td>
                <td className="p-3"><Badge s={e.status}/></td>
                <td className="p-3">
  <Link to={`/expense/${e.id}`} className="text-blue-600 underline">View</Link>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Badge({ s }: { s: ExpenseStatus }) {
  const map: Record<ExpenseStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    waiting: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    submitted: 'bg-blue-100 text-blue-800', // unused here
  } as any
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s]}`}>{s}</span>
}
