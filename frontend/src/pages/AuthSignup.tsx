import { useEffect, useMemo, useState } from 'react'
import { AuthAPI } from '../lib/api'
import { useNavigate, Link } from 'react-router-dom'

type CountryRow = { code: string; name: string; currencies: string[] }

export default function AuthSignup() {
  const nav = useNavigate()

  const [name, setName] = useState('Admin')
  const [email, setEmail] = useState('admin@hack.co')
  const [password, setPassword] = useState('password')
  const [confirm, setConfirm] = useState('password')
  const [companyName, setCompanyName] = useState('Hack Co')

  const [countries, setCountries] = useState<CountryRow[]>([])
  const [country, setCountry] = useState('IN')
  const [currency, setCurrency] = useState('INR')

  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch countries + currencies
  useEffect(() => {
    const ac = new AbortController()
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies,cca2', { signal: ac.signal })
      .then(r => r.json())
      .then((rows: any[]) => {
        const list: CountryRow[] = rows
          .map(r => ({
            code: r.cca2,
            name: r.name?.common ?? r.cca2,
            currencies: Object.keys(r.currencies || {})
          }))
          .filter(x => x.currencies.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name))
        setCountries(list)
      })
      .catch(() => {/* ignore on unmount/network */})
    return () => ac.abort()
  }, [])

  // Currency options for the selected country
  const currencyChoices = useMemo(
    () => countries.find(c => c.code === country)?.currencies ?? [],
    [country, countries]
  )

  // Keep currency in sync with country (pick the first if current not available)
  useEffect(() => {
    if (currencyChoices.length && !currencyChoices.includes(currency)) {
      setCurrency(currencyChoices[0])
    }
  }, [currencyChoices]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')

    if (password !== confirm) {
      setErr('Passwords do not match')
      return
    }
    if (!name || !email || !companyName) {
      setErr('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      await AuthAPI.signup({ name, companyName, country, currency, email, password })
      nav('/login') // after signup → go to signin
    } catch (e: any) {
      setErr(e?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const disableForm = loading

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} noValidate className="bg-white rounded-2xl p-8 w-full max-w-md shadow grid gap-3">
        <h1 className="text-2xl font-bold">Admin (company) Signup</h1>
        {err && <div className="text-sm text-red-600" role="alert" aria-live="polite">{err}</div>}

        <label className="grid gap-1 text-sm">
          <span>Name</span>
          <input
            required
            disabled={disableForm}
            className="border rounded-xl px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input
            required
            type="email"
            disabled={disableForm}
            className="border rounded-xl px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Password</span>
          <input
            required
            type="password"
            disabled={disableForm}
            className="border rounded-xl px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Confirm password</span>
          <input
            required
            type="password"
            disabled={disableForm}
            className="border rounded-xl px-3 py-2"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>Country selection</span>
          <select
            disabled={disableForm}
            className="border rounded-xl px-3 py-2"
            value={country}
            onChange={e => setCountry(e.target.value)}
          >
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span>Company currency</span>
          <select
            disabled={disableForm || currencyChoices.length === 1}
            className="border rounded-xl px-3 py-2"
            value={currency}
            onChange={e => setCurrency(e.target.value.toUpperCase())}
          >
            {currencyChoices.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            {currencyChoices.length > 1 ? 'Choose one of the country’s currencies' : 'Auto-selected'}
          </span>
        </label>

        <label className="grid gap-1 text-sm">
          <span>Company name</span>
          <input
            required
            disabled={disableForm}
            className="border rounded-xl px-3 py-2"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            autoComplete="organization"
          />
        </label>

        <button
          disabled={disableForm}
          className="rounded-xl bg-blue-600 text-white px-4 py-2"
        >
          {loading ? 'Creating…' : 'Signup'}
        </button>

        <div className="text-sm text-right">
          <Link className="text-blue-600" to="/login">Already have an account? Signin</Link>
        </div>
      </form>
    </div>
  )
}
