import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UsersAPI, FlowAPI } from '../lib/api'
import { getUser, clearToken } from '../lib/auth'
import type { ApprovalFlow, User as TUser } from '../types'
import {
  Users, Settings, FileText, LogOut, TrendingUp,
  UserCheck, Briefcase, CheckCircle, ChevronRight
} from 'lucide-react'

type Counts = { total: number | string; managers: number | string; employees: number | string }

export default function AdminHome() {
  const nav = useNavigate()
  const me = getUser()
  const [counts, setCounts] = useState<Counts>({ total: '—', managers: '—', employees: '—' })
  const [flow, setFlow] = useState<ApprovalFlow | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setErr('')
        const [users, f] = await Promise.all([UsersAPI.list(), FlowAPI.get()])
        const managers = users.filter(u => u.role === 'manager').length
        const employees = users.filter(u => u.role === 'employee').length
        setCounts({ total: users.length, managers, employees })
        setFlow(f)
      } catch (e: any) {
        setErr(e?.message || 'Failed to load dashboard data')
      }
    })()
  }, [])

  function logout() {
    clearToken()
    nav('/login', { replace: true })
  }

  const flowParts: string[] = []
  if (flow) {
    flowParts.push(flow.isManagerFirst ? 'Manager approver' : 'No manager step')
    if (flow.sequenceEnabled) flowParts.push('Sequence on')
    if (flow.approvers?.length) flowParts.push(`${flow.approvers.length} approver(s)`)
    if (flow.percentThreshold) flowParts.push(`${flow.percentThreshold}% threshold`)
    if (flow.specificApproverId) flowParts.push('Specific approver set')
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
                <p className="text-sm text-gray-600">
                  Signed in as <span className="font-semibold text-blue-600">{me?.email || 'admin@hack.co'}</span>
                </p>
              </div>
              <button
                onClick={logout}
                className="self-start sm:self-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {err && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
              <span className="text-red-600 font-medium">Error:</span>
              <span className="text-sm text-red-800">{err}</span>
            </div>
          )}

          {/* Quick Actions */}
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                to="/admin/users"
                icon={<Users className="w-6 h-6" />}
                title="Manage Users"
                desc="Create managers & employees, resend temp passwords"
                gradient="from-blue-500 to-indigo-500"
              />
              <Card
                to="/admin/flows"
                icon={<Settings className="w-6 h-6" />}
                title="Approval Rules"
                desc="Manager-first, sequence, % threshold, specific approver"
                gradient="from-indigo-500 to-purple-500"
              />
              <Card
                to="/expenses"
                icon={<FileText className="w-6 h-6" />}
                title="Expenses"
                desc="Open the expenses area"
                gradient="from-purple-500 to-pink-500"
              />
            </div>
          </section>

          {/* At a Glance */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">At a Glance</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Stat label="Total Users" value={counts.total} icon={<Users className="w-5 h-5" />} color="blue" />
              <Stat label="Managers" value={counts.managers} icon={<UserCheck className="w-5 h-5" />} color="indigo" />
              <Stat label="Employees" value={counts.employees} icon={<Briefcase className="w-5 h-5" />} color="purple" />
            </div>

            {/* Approval Flow Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Current Approval Flow
                  </h3>
                  <p className="text-base text-gray-900 mb-3">
                    {flow ? flowParts.join(' · ') : '—'}
                  </p>
                  <Link
                    to="/admin/flows"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group"
                  >
                    <span>Edit in Approval Rules</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
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
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </>
  )
}

function Card({
  to, icon, title, desc, gradient
}: { to: string; icon: React.ReactNode; title: string; desc: string; gradient: string }) {
  return (
    <Link
      to={to}
      className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 text-left overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300 transform translate-x-16 -translate-y-16`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 text-white transform group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ChevronRight className="w-5 h-5 text-indigo-600" />
      </div>
    </Link>
  )
}

function Stat({
  label, value, icon, color
}: { label: string; value: string | number; icon: React.ReactNode; color: 'blue' | 'indigo' | 'purple' }) {
  const colorMap: Record<typeof color, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 transform hover:-translate-y-1 transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-10 h-10 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}
