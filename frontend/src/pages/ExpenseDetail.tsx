// src/pages/ExpenseDetail.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ExpensesAPI } from '../lib/api'
import { getUser } from '../lib/auth'
import type { ExpenseDetail as ExpenseDetailT } from '../types'
import {
  ArrowLeft, Calendar, Tag, FileText, MessageSquare, Clock, User,
  CreditCard, TrendingUp, CheckCircle, XCircle, Loader2
} from 'lucide-react'

export default function ExpenseDetail() {
  const nav = useNavigate()
  const { id } = useParams<{ id: string }>()
  const me = getUser()

  const [exp, setExp] = useState<ExpenseDetailT | null>(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const expId = Number(id)
    if (!expId || Number.isNaN(expId)) {
      setErr('Invalid expense id'); setLoading(false); return
    }
    ;(async () => {
      try {
        setErr(''); setLoading(true)
        const detail = await ExpensesAPI.get(expId)
        setExp(detail)
      } catch (e: any) {
        setErr(e?.message || 'Failed to load expense')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  function back() {
    if (window.history.length > 1) nav(-1)
    else {
      const role = me?.role
      if (role === 'manager') nav('/approvals', { replace: true })
      else nav('/expenses', { replace: true })
    }
  }

  const statusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      case 'rejected': return 'bg-red-100 text-red-700 border border-red-200'
      case 'pending':
      case 'under_review': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      case 'submitted': return 'bg-blue-100 text-blue-700 border border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const statusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <Blobs />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading expense details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error Loading Expense</h3>
              <p className="text-sm text-red-700">{err}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!exp) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Blobs />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={back}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusClass(exp.status)}`}>
              {statusIcon(exp.status)}
              <span className="capitalize">{exp.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Expense #{exp.id}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{(exp as any).employeeName ?? exp.employeeId}</span>
                <span className="text-gray-400">•</span>
                <span>Employee ID: {exp.employeeId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Details */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Expense Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailField
              icon={<Calendar className="w-5 h-5" />}
              label="Spend Date"
              value={new Date(exp.spendDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <DetailField icon={<Tag className="w-5 h-5" />} label="Category" value={exp.category} />
            <DetailField
              icon={<CreditCard className="w-5 h-5" />}
              label="Original Amount"
              value={<span className="text-lg font-semibold text-indigo-600">{exp.amount} {exp.currency}</span>}
            />
            <DetailField
              icon={<TrendingUp className="w-5 h-5" />}
              label="Company Currency"
             value={<span className="text-lg font-semibold text-gray-900">
  {exp.amountCompanyCcy} {(exp as any).companyCurrency ?? 'company ccy'}
</span>}
            />
            <DetailField icon={<FileText className="w-5 h-5" />} label="Description" value={exp.description} wide />
            {(exp as any).remarks && (
              <DetailField icon={<MessageSquare className="w-5 h-5" />} label="Remarks" value={(exp as any).remarks} wide />
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2>Timeline</h2>
          </div>

          {exp.timeline?.length ? (
            <div className="space-y-4">
              {exp.timeline.map((ev, i) => (
                <div key={i} className="relative pl-8 pb-4 last:pb-0">
                  {i < exp.timeline.length - 1 && (
                    <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-transparent"></div>
                  )}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white shadow-md"></div>

                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(ev.at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(ev.decision)}`}>
                        {ev.decision.replace('_', ' ')}
                      </span>
                    </div>
                    {ev.comment && <p className="text-sm text-gray-700">{ev.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No timeline entries.</div>
          )}
        </div>
      </div>

      <StyleTag />
    </div>
  )
}

function DetailField({
  icon, label, value, wide
}: { icon: React.ReactNode; label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        <span className="text-indigo-600">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}

function Blobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
    </div>
  )
}

function StyleTag() {
  return (
    <style>{`
      @keyframes blob {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(20px, -20px) scale(1.1); }
        50% { transform: translate(-20px, 20px) scale(0.9); }
        75% { transform: translate(20px, 20px) scale(1.05); }
      }
      .animate-blob { animation: blob 7s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
    `}</style>
  )
}
