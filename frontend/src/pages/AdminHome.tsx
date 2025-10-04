import { Link, useNavigate } from 'react-router-dom'
import { clearToken, getUser } from '../lib/auth'
import { useEffect, useState } from 'react'
import { UsersAPI, FlowAPI } from '../lib/api'
import type {  ApprovalFlow } from '../types'

type Counts = { total: number | string; managers: number | string; employees: number | string }

export default function AdminHome() {
    const nav = useNavigate()
    const me = getUser()
   const [counts, setCounts] = useState<Counts>({ total: '—', managers: '—', employees: '—' })
    const [flow, setFlow] = useState<ApprovalFlow | null>(null)

    useEffect(() => {
        UsersAPI.list().then(rows => {
            const managers = rows.filter(r => r.role === 'manager').length
            const employees = rows.filter(r => r.role === 'employee').length
            setCounts({ total: rows.length, managers, employees })
        }).catch(() => { })
        FlowAPI.get().then(setFlow).catch(() => { })
    }, [])

    function logout() { clearToken(); nav('/login', { replace: true }) }

    const flowParts: string[] = []
    if (flow) {
        flowParts.push(flow.isManagerFirst ? 'Manager approver' : 'No manager step')
        if (flow.sequenceEnabled) flowParts.push('Sequence on')
        if (flow.approvers?.length) flowParts.push(`${flow.approvers.length} approver(s)`)
        if (flow.percentThreshold) flowParts.push(`${flow.percentThreshold}% threshold`)
        if (flow.specificApproverId) flowParts.push('Specific approver set')
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Admin dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">Signed in as <span className="font-medium">{me?.email}</span></p>
                </div>
                <button onClick={logout} className="rounded-xl bg-red-600 text-white px-4 py-2">Logout</button>
            </header>

            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card to="/admin/users" title="Manage users" desc="Create managers & employees, resend temp passwords" />
                    <Card to="/admin/flows" title="Approval rules" desc="Manager-first, sequence, % threshold, specific approver" />
                    <Card to="/expenses" title="Expenses" desc="Browse expenses (wire later)" />
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-3">At a glance</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                    <Stat label="Total users" value={counts.total} />
                    <Stat label="Managers" value={counts.managers} />
                    <Stat label="Employees" value={counts.employees} />
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 mt-3">
                    <div className="text-xs text-gray-500 mb-1">Current approval flow</div>
                    <div className="text-sm">{flow ? flowParts.join(' · ') : '—'}</div>
                    <div className="text-xs text-gray-500 mt-1">Edit in <Link to="/admin/flows" className="underline">Approval rules</Link></div>
                </div>
            </section>
        </div>
    )
}

function Card({ to, title, desc }: { to: string; title: string; desc: string }) {
    return (
        <Link to={to} className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition">
            <div className="text-base font-medium">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{desc}</div>
        </Link>
    )
}
function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
    )
}
