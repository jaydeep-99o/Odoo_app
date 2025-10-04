import { Link } from 'react-router-dom'
import { clearToken, getUser } from '../lib/auth'

export default function Home() {
  const user = getUser() || { role: 'employee', email: 'user@example.com' } as any

  const actions: Record<string, { to: string; title: string; desc: string }[]> = {
    admin: [
      { to: '/admin/users', title: 'Add users', desc: 'Create managers and employees, resend temp passwords' },
      { to: '/admin/flows', title: 'Approval rules', desc: 'Manager-first, sequence, % threshold, specific approver' },
      { to: '/expenses', title: 'View expenses', desc: 'Browse company expenses (coming next)' },
    ],
    manager: [
      { to: '/approvals', title: 'Approvals queue', desc: 'Review and approve/reject pending requests' },
      { to: '/expenses', title: 'Team expenses', desc: 'Overview of your team (coming next)' },
    ],
    employee: [
      { to: '/expenses/new', title: 'New expense', desc: 'Upload receipt, OCR fills details automatically' },
      { to: '/expenses', title: 'My expenses', desc: 'Track submitted, waiting, and approved' },
    ],
  }

  const role = user.role as 'admin' | 'manager' | 'employee'
  const cards = actions[role] || actions.employee

  function logout() {
    clearToken()
    // optional: clear other local state here if you stored more
    window.location.assign('/login')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="text-sm text-gray-600 mt-1">
            You’re signed in as <span className="font-medium">{user?.email}</span> · Role:
            <span className="ml-1 inline-block rounded-full px-2 py-0.5 text-xs bg-gray-100">{role}</span>
          </p>
        </div>
        <button onClick={logout} className="rounded-xl bg-red-600 text-white px-4 py-2">
          Logout
        </button>
      </header>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition"
            >
              <div className="text-base font-medium">{c.title}</div>
              <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder stats – safe to remove; wire later when endpoints are ready */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">At a glance</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="Waiting approvals" value="—" hint={role === 'manager' ? 'Shows pending count' : 'For managers'} />
          <Stat label="Approved this month" value="—" hint="Company currency" />
          <Stat label="My submissions" value="—" hint={role === 'employee' ? 'Your total expenses' : 'Employees’ total'} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          (We’ll populate these once your teammate exposes list endpoints.)
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint ? <div className="text-xs text-gray-500 mt-1">{hint}</div> : null}
    </div>
  )
}
