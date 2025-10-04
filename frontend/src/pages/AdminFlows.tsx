import { useEffect, useMemo, useState } from 'react'
import { FlowAPI, UsersAPI } from '../lib/api'
import type { ApprovalFlow, User } from '../types'
import {
  Settings, Users, CheckCircle, ArrowRight, Percent, UserCheck,
  Save, X, Loader2, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react'

export default function AdminFlows() {
  const [flow, setFlow] = useState<ApprovalFlow | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string>('')

  const managersAndAdmins = useMemo(
    () => users.filter(u => u.role !== 'employee'),
    [users]
  )

  // Load users + current flow from API
  useEffect(() => {
    (async () => {
      setErr('')
      try {
        const [u, f] = await Promise.all([UsersAPI.list(), FlowAPI.get()])
        setUsers(u)
        setFlow(f)
      } catch (e: any) {
        setErr(e?.message || 'Failed to load approval rules')
      }
    })()
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
    setFlow({
      ...flow,
      approvers: flow.approvers.map(a => a.userId === uid ? { ...a, required } : a)
    })
  }

  function move(uid: number, dir: -1 | 1) {
    if (!flow || !flow.sequenceEnabled) return
    const idx = flow.approvers.findIndex(a => a.userId === uid)
    if (idx < 0) return
    const ni = idx + dir
    if (ni < 0 || ni >= flow.approvers.length) return
    const arr = [...flow.approvers]
    const [sp] = arr.splice(idx, 1)
    arr.splice(ni, 0, sp)
    setFlow({ ...flow, approvers: arr })
  }

  async function save() {
    if (!flow) return
    setSaving(true); setErr('')
    try {
      // sanitize percentThreshold (optional)
      const pt = flow.percentThreshold
      const clean: ApprovalFlow = {
        ...flow,
        percentThreshold: typeof pt === 'number' && pt >= 1 && pt <= 100 ? pt : undefined
      }
      const updated = await FlowAPI.put(clean)
      setFlow(updated)
    } catch (e: any) {
      setErr(e?.message || 'Failed to save rules')
    } finally {
      setSaving(false)
    }
  }

  async function reload() {
    setSaving(true); setErr('')
    try {
      const f = await FlowAPI.get()
      setFlow(f)
    } catch (e: any) {
      setErr(e?.message || 'Failed to reload rules')
    } finally {
      setSaving(false)
    }
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-indigo-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Approval Rules</h1>
            </div>
            <p className="text-sm text-gray-600">Configure how expenses are approved in your organization</p>
          </div>

          {/* Error banner */}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">{err}</div>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  Basic Settings
                </h2>

                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={flow.isManagerFirst}
                    onChange={e => setFlow({ ...flow, isManagerFirst: e.target.checked })}
                    className="mt-0.5 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Manager is an approver</span>
                    <p className="text-xs text-gray-500 mt-1">Employee's direct manager is included in the chain</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={flow.sequenceEnabled}
                    onChange={e => setFlow({ ...flow, sequenceEnabled: e.target.checked })}
                    className="mt-0.5 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Use sequence of approvers</span>
                    <p className="text-xs text-gray-500 mt-1">Approvers must approve in order (Step 1 → Step 2 → Step 3)</p>
                  </div>
                </label>
              </div>

              {/* Approvers Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Approvers</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {managersAndAdmins.map(u => {
                    const picked = flow.approvers.find(a => a.userId === u.id)
                    return (
                      <div
                        key={u.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          picked ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!picked}
                            onChange={() => toggleApprover(u.id)}
                            className="mt-0.5 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{u.name || u.email}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                {u.role}
                              </span>
                            </div>
                          </div>
                        </label>

                        {picked && (
                          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-[auto,1fr,auto] items-center gap-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!picked.required}
                                onChange={e => setReq(u.id, e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 font-medium">Required approver</span>
                            </label>

                            <div className="text-xs text-gray-500">
                              {flow.sequenceEnabled ? 'Step order shown by position' : 'Order not enforced'}
                            </div>

                            {flow.sequenceEnabled && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => move(u.id, -1)}
                                  className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-50"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => move(u.id, 1)}
                                  className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-50"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    When sequence is enabled, the top-to-bottom order defines Step 1, Step 2, …
                  </p>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Advanced Settings</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Percent Threshold */}
                  <div className="space-y-2">
                    <label htmlFor="percent" className="block text-sm font-semibold text-gray-700">
                      Percent Threshold
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Percent className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <input
                        id="percent"
                        type="number"
                        min={1}
                        max={100}
                        placeholder="e.g., 60"
                        className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base"
                        value={flow.percentThreshold ?? ''}
                        onChange={e =>
                          setFlow({
                            ...flow,
                            percentThreshold: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Expense is approved when ≥ this % of selected approvers approve
                    </p>
                  </div>

                  {/* Specific Approver */}
                  <div className="space-y-2">
                    <label htmlFor="specific" className="block text-sm font-semibold text-gray-700">
                      Specific Approver
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <UserCheck className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      </div>
                      <select
                        id="specific"
                        className="block w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 text-base appearance-none"
                        value={String(flow.specificApproverId ?? '')}
                        onChange={e =>
                          setFlow({
                            ...flow,
                            specificApproverId: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                      >
                        <option value="">— None —</option>
                        {managersAndAdmins.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name || u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">
                      If this user approves, the expense auto-approves (hybrid rule)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                      <span className="relative z-10">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Save Rules</span>
                    </>
                  )}
                </button>

                <button
                  onClick={reload}
                  className="sm:w-auto px-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </div>
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
