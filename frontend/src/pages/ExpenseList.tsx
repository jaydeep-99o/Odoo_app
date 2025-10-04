import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, FileText, Tag, DollarSign, Eye, Filter, CheckCircle, XCircle, Clock, FileCheck, Inbox } from 'lucide-react'

type ExpenseStatus = 'draft' | 'waiting' | 'approved' | 'rejected' | 'submitted'

type Expense = {
  id: number
  spendDate: string
  description: string
  category: string
  amount: number
  currency: string
  amountCompanyCcy: number
  companyCurrency: string
  status: ExpenseStatus
}

export default function ExpenseList() {
  const nav = useNavigate()
  const [rows, setRows] = useState<Expense[]>([])
  const [tab, setTab] = useState<ExpenseStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRows([
        { id: 1, spendDate: '2024-03-15T10:00:00Z', description: 'Business lunch with client', category: 'Meals',   amount: 85,  currency: 'USD', amountCompanyCcy: 85,  companyCurrency: 'USD', status: 'approved' },
        { id: 2, spendDate: '2024-03-14T10:00:00Z', description: 'Conference flight tickets',   category: 'Travel', amount: 450, currency: 'EUR', amountCompanyCcy: 500, companyCurrency: 'USD', status: 'waiting' },
        { id: 3, spendDate: '2024-03-10T10:00:00Z', description: 'Hotel accommodation',         category: 'Lodging',amount: 200, currency: 'USD', amountCompanyCcy: 200, companyCurrency: 'USD', status: 'approved' },
        { id: 4, spendDate: '2024-03-08T10:00:00Z', description: 'Office supplies',             category: 'Supplies',amount: 45,  currency: 'USD', amountCompanyCcy: 45,  companyCurrency: 'USD', status: 'rejected' },
        { id: 5, spendDate: '2024-03-05T10:00:00Z', description: 'Software subscription',       category: 'Software',amount: 99,  currency: 'USD', amountCompanyCcy: 99,  companyCurrency: 'USD', status: 'draft' },
        // Example "submitted" row:
        { id: 6, spendDate: '2024-03-18T10:00:00Z', description: 'Taxi to airport',             category: 'Travel', amount: 60,  currency: 'EUR', amountCompanyCcy: 66,  companyCurrency: 'USD', status: 'submitted' },
      ])
      setLoading(false)
    }, 800)
  }, [])

  // Sort newest → oldest once, then filter
  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) => new Date(b.spendDate).getTime() - new Date(a.spendDate).getTime()
      ),
    [rows]
  )

  const filtered = useMemo(
    () => (tab === 'all' ? sorted : sorted.filter(r => r.status === tab)),
    [sorted, tab]
  )

  const getTabIcon = (status: ExpenseStatus | 'all') => {
    switch (status) {
      case 'all': return <Inbox className="w-4 h-4" />
      case 'draft': return <FileText className="w-4 h-4" />
      case 'waiting': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'submitted': return <FileCheck className="w-4 h-4" />
    }
  }

  const getTabCount = (status: ExpenseStatus | 'all') =>
    status === 'all' ? rows.length : rows.filter(r => r.status === status).length

  function newExpense() {
    alert('Navigate to new expense form')
    // nav('/expenses/new')
  }

  function viewExpense(id: number) {
    // nav(`/expenses/${id}`)
    alert(`Navigate to expense #${id}`)
  }

  const fmt = (amt: number, cur: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amt)
    } catch {
      return `${amt} ${cur}`
    }
  }

  const totalCompany = filtered.reduce((sum, e) => sum + e.amountCompanyCcy, 0)
  const sameCompanyCcy = filtered.length
    ? filtered.every(e => e.companyCurrency === filtered[0].companyCurrency)
    : true
  const totalLabel = sameCompanyCcy ? filtered[0]?.companyCurrency ?? 'USD' : 'company ccy'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
                <p className="text-sm text-gray-600 mt-0.5">Manage and track your expense reports</p>
              </div>
            </div>
            <button
              onClick={newExpense}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>New Expense</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-semibold">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'draft', 'submitted', 'waiting', 'approved', 'rejected'] as const).map(k => {
              const count = getTabCount(k)
              const isActive = tab === k
              return (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {getTabIcon(k)}
                  <span className="capitalize">{k}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading expenses...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No expenses found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {tab === 'all'
                  ? "You haven't created any expenses yet."
                  : `No expenses with status "${tab}".`}
              </p>
              {tab === 'all' && (
                <button
                  onClick={newExpense}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Expense</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Date</span>
                      </div>
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Description</span>
                      </div>
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Category</span>
                      </div>
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Amount</span>
                      </div>
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, idx) => (
                    <tr
                      key={e.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4 text-sm text-gray-700">
                        {new Date(e.spendDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{e.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          <Tag className="w-3 h-3" />
                          {e.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {fmt(e.amount, e.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fmt(e.amountCompanyCcy, e.companyCurrency)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge s={e.status} />
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => viewExpense(e.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{filtered.length}</span> expense{filtered.length !== 1 ? 's' : ''}
                {tab !== 'all' && (
                  <span>
                    {' '}with status <span className="font-bold capitalize">{tab}</span>
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Total:{' '}
                <span className="font-bold text-indigo-600 text-lg">
                  {sameCompanyCcy ? fmt(totalCompany, totalLabel) : `${totalCompany} ${totalLabel}`}
                </span>
              </div>
            </div>
          </div>
        )}
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
    </div>
  )
}

function Badge({ s }: { s: ExpenseStatus }) {
  const config: Record<ExpenseStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    draft:     { bg: 'bg-gray-100',   text: 'text-gray-700',   icon: <FileText className="w-3 h-3" /> },
    waiting:   { bg: 'bg-amber-100',  text: 'text-amber-800',  icon: <Clock className="w-3 h-3" /> },
    approved:  { bg: 'bg-emerald-100',text: 'text-emerald-800',icon: <CheckCircle className="w-3 h-3" /> },
    rejected:  { bg: 'bg-rose-100',   text: 'text-rose-800',   icon: <XCircle className="w-3 h-3" /> },
    submitted: { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: <FileCheck className="w-3 h-3" /> },
  }
  const { bg, text, icon } = config[s]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bg} ${text} border border-current/20`}>
      {icon}
      <span className="capitalize">{s}</span>
    </span>
  )
}
