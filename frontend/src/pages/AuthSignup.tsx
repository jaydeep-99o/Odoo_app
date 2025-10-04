import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api'
import { User, Mail, Lock, Building2, Globe, DollarSign, Loader2, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'

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

  // fetch countries
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
      .catch(() => {})
    return () => ac.abort()
  }, [])

  // currency choices for selected country
  const currencyChoices = useMemo(
    () => countries.find(c => c.code === country)?.currencies ?? [],
    [country, countries]
  )

  // keep currency in sync
  useEffect(() => {
    if (currencyChoices.length && !currencyChoices.includes(currency)) {
      setCurrency(currencyChoices[0])
    }
  }, [currencyChoices, currency])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr('')
    if (!name || !email || !companyName) return setErr('Please fill all required fields')
    if (password !== confirm) return setErr('Passwords do not match')

    setLoading(true)
    try {
      await AuthAPI.signup({ name, companyName, country, currency, email, password })
      nav('/login', { replace: true })
    } catch (e: any) {
      setErr(e?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const disableForm = loading

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-2xl z-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            {/* header (matches login) */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-transform hover:scale-110 duration-300 relative z-10">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight relative z-10">Create Your Account</h1>
              <p className="text-blue-100 text-sm sm:text-base relative z-10">Join us and start managing your company</p>
            </div>

            {/* form */}
            <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
              {err && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3 animate-slideDown" role="alert">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 flex-1">{err}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      disabled={disableForm}
                      className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={disableForm}
                      className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      disabled={disableForm}
                      className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <input
                      id="confirm"
                      type="password"
                      required
                      disabled={disableForm}
                      className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700">Country</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 z-10">
                      <Globe className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <select
                      id="country"
                      disabled={disableForm}
                      className="block w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 text-base disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                    >
                      {countries.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label htmlFor="currency" className="block text-sm font-semibold text-gray-700">Currency</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items center pointer-events-none transition-colors duration-200 z-10">
                      <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                    </div>
                    <select
                      id="currency"
                      disabled={disableForm || currencyChoices.length === 1}
                      className="block w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 text-base disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                      value={currency}
                      onChange={e => setCurrency(e.target.value.toUpperCase())}
                    >
                      {currencyChoices.map(cur => (
                        <option key={cur} value={cur}>{cur}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 pl-1">
                    {currencyChoices.length > 1 ? "Choose one of the country's currencies" : 'Auto-selected based on country'}
                  </p>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700">Company Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                    <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                  </div>
                  <input
                    id="company"
                    type="text"
                    required
                    disabled={disableForm}
                    className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    autoComplete="organization"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={disableForm}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-base relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                    <span className="relative z-10">Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Create Account</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <p className="text-center mt-8 text-sm text-gray-600 flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span>Secure registration with encrypted data</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
        .animate-shimmer { animation: shimmer 3s infinite; }

        /* custom select arrow */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }

        @media (max-width: 480px) { input, select, button { font-size: 16px !important; } }
        .hover\\:shadow-3xl:hover { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
      `}</style>
    </>
  )
}
