import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../lib/api'
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

const nextByRole: Record<'admin'|'manager'|'employee', string> = {
  admin: '/admin',
  manager: '/approvals',
  employee: '/expenses',
}

export default function AuthLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@hack.co')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingForgot, setSendingForgot] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setErr('')
    setMsg('')
    setLoading(true)
    try {
      const res = await AuthAPI.login(email.trim(), password)

      // persist session for route guards
      localStorage.setItem('expman_token', res.token)
      localStorage.setItem('expman_user', JSON.stringify(res.user))

      if (res.resetRequired) {
        localStorage.setItem('reset_required', '1')
        setMsg('Login successful — please set a new password.')
        setTimeout(() => nav('/change-password', { replace: true }), 350)
      } else {
        localStorage.removeItem('reset_required')
        setMsg('Login successful! Redirecting…')
        setTimeout(() => nav(nextByRole[res.user.role] || '/', { replace: true }), 350)
      }
    } catch (e: any) {
      setErr(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function forgot(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    if (sendingForgot) return

    setErr('')
    setMsg('')
    setSendingForgot(true)
    try {
      await AuthAPI.forgot(email.trim())
      setMsg('If the email exists, a temporary password has been sent.')
    } catch (e: any) {
      // Don’t reveal whether the email exists
      setMsg('If the email exists, a temporary password has been sent.')
    } finally {
      setSendingForgot(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-md z-10">
          {/* Main card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
              <p className="text-blue-100 text-sm sm:text-base">Sign in to continue to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
              {/* Error message */}
              {err && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start space-x-3 animate-slideDown" role="alert">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 flex-1">{err}</p>
                </div>
              )}

              {/* Success message */}
              {msg && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start space-x-3 animate-slideDown" role="alert">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 flex-1">{msg}</p>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-base"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-base relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                    <span className="relative z-10">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Sign In</span>
                  </>
                )}
              </button>

              {/* Footer links */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={forgot}
                    disabled={sendingForgot}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {sendingForgot ? 'Sending reset email...' : 'Forgot your password?'}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">New here?</span>
                  </div>
                </div>

                <Link
                  to="/signup"
                  className="block w-full text-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Create an Account
                </Link>
              </div>
            </form>
          </div>

          {/* Footer text */}
          <p className="text-center mt-8 text-sm text-gray-600 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Protected by industry-standard encryption</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
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

        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 3s infinite; }

        /* Prevent zoom on iOS */
        @media (max-width: 480px) { input, button { font-size: 16px !important; } }

        /* Enhanced shadow */
        .hover\\:shadow-3xl:hover { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
      `}</style>
    </>
  )
}
