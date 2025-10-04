import { useState } from 'react'
import {
  Calendar, Tag, FileText, DollarSign, CreditCard, MessageSquare,
  Upload, Scan, Save, X, ArrowLeft, CheckCircle, XCircle,
  File as FileIcon, // 👈 rename to avoid shadowing DOM File type
  Loader2
} from 'lucide-react'

export default function ExpenseNew() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [spendDate, setSpendDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [paidBy, setPaidBy] = useState('')
  const [remarks, setRemarks] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [currency, setCurrency] = useState('INR')
  const [file, setFile] = useState<File | null>(null) // DOM File type
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [ocring, setOcring] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr('')
    setMsg('')

    if (description.trim() === '' || amount === '' || Number(amount) <= 0) {
      setErr('Description and a positive amount are required')
      return
    }

    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      try {
        setMsg('Expense saved successfully!')
        setTimeout(() => {
          alert('Navigate to /expenses')
        }, 1000)
      } catch (e: any) {
        setErr(e?.message || 'Failed to save expense')
      } finally {
        setSaving(false)
      }
    }, 1500)
  }

  async function runOCR() {
    if (!file) {
      setMsg('Please attach a receipt image first')
      return
    }
    setOcring(true)
    setMsg('Reading receipt...')
    setTimeout(() => {
      try {
        setAmount(145.5)
        setCurrency('USD')
        setSpendDate('2024-03-15')
        setDescription('Business lunch at Restaurant')
        setMsg('Receipt processed successfully! Please review the details.')
      } catch {
        setMsg('Could not read the receipt. Please fill manually.')
      } finally {
        setOcring(false)
      }
    }, 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null
    setErr('')
    setMsg('')
    if (selectedFile) {
      // basic size check (<=5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErr('File too large (max 5MB)')
        e.currentTarget.value = ''
        setFile(null)
        setPreviewUrl(null)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(selectedFile)
      setFile(selectedFile)
    } else {
      setFile(null)
      setPreviewUrl(null)
    }
  }

  function removeFile() {
    setFile(null)
    setPreviewUrl(null)
  }

  function cancel() {
    alert('Navigate back')
  }

  const categories = ['Food', 'Travel', 'Hotel', 'Fuel', 'Supplies', 'Software', 'Other']
  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={cancel}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expenses</span>
        </button>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Expense</h1>
              <p className="text-sm text-gray-600 mt-0.5">Fill in the details below to create a new expense</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {msg && (
          <div
            role="status"
            aria-live="polite"
            className={`${
              msg.includes('success') || msg.includes('processed')
                ? 'bg-emerald-50 border-emerald-500'
                : 'bg-blue-50 border-blue-500'
            } border-l-4 rounded-lg p-4 flex items-start gap-3 mb-6 animate-slideDown`}
          >
            <CheckCircle
              className={`w-5 h-5 ${
                msg.includes('success') || msg.includes('processed') ? 'text-emerald-500' : 'text-blue-500'
              } flex-shrink-0 mt-0.5`}
            />
            <p className={`text-sm ${msg.includes('success') || msg.includes('processed') ? 'text-emerald-800' : 'text-blue-800'} flex-1 font-medium`}>
              {msg}
            </p>
          </div>
        )}

        {err && (
          <div role="alert" className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 mb-6 animate-slideDown">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 flex-1 font-medium">{err}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 sm:p-8 space-y-6">
          {/* Date and Category */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Spend Date</span>
              </label>
              <input
                id="date"
                type="date"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900"
                value={spendDate}
                onChange={e => setSpendDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>Category</span>
              </label>
              <select
                id="category"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                {['Food', 'Travel', 'Hotel', 'Fuel', 'Supplies', 'Software', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Description</span>
            </label>
            <input
              id="description"
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
              placeholder="e.g., Business lunch with client"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amount, Currency, Payment Method */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="amount" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Amount</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label htmlFor="currency" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Currency</span>
              </label>
              <select
                id="currency"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                required
              >
                {['INR', 'USD', 'EUR', 'GBP', 'JPY'].map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="paidBy" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Paid By</span>
              </label>
              <input
                id="paidBy"
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                placeholder="Card / Cash / UPI"
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Remarks (Optional)</span>
            </label>
            <textarea
              id="remarks"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Add any additional notes..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

          {/* Receipt Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span>Receipt Image</span>
                </div>

                {!file ? (
                  <div>
                    <label htmlFor="file" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200">
                        <FileIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Choose receipt image</span>
                      </div>
                    </label>
                    <input
                      id="file"
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-gray-500 mt-2">Supported: JPG, PNG, PDF (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button type="button" onClick={removeFile} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    {previewUrl && file.type.startsWith('image/') && (
                      <img src={previewUrl} alt="Receipt preview" className="w-full h-48 object-cover rounded-lg" />
                    )}
                  </div>
                )}
              </div>

              {file && (
                <button
                  type="button"
                  onClick={runOCR}
                  disabled={ocring}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:cursor-not-allowed transition-all duration-200"
                >
                  {ocring ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Reading...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      <span>Extract with OCR</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Expense</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
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
      `}</style>
    </div>
  )
}
