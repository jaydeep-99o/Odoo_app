import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExpensesAPI, OCRAPI } from '../lib/api'

export default function ExpenseNew() {
  const nav = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [spendDate, setSpendDate] = useState(() => new Date().toISOString().slice(0,10))
  const [paidBy, setPaidBy] = useState('')
  const [remarks, setRemarks] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [currency, setCurrency] = useState('INR')
  const [file, setFile] = useState<File | null>(null)
  const [err, setErr] = useState(''), [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false), [ocring, setOcring] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setMsg('')
    if (!amount || !description) { setErr('Add description and amount'); return }
    setSaving(true)
    try {
      await ExpensesAPI.create({ description, category, spendDate, paidBy, remarks, amount: Number(amount), currency } as any)
      nav('/expenses')
    } catch (e: any) { setErr(e.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  async function runOCR() {
    if (!file) { setMsg('Attach a receipt image first'); return }
    setOcring(true); setMsg('Reading receipt…')
    try {
      const res = await OCRAPI.extract(file)
      if (res.amount) setAmount(res.amount)
      if (res.currency) setCurrency(res.currency)
      if (res.date) setSpendDate(res.date)
      if (res.description) setDescription(res.description)
      setMsg('Filled from receipt. Please review.')
    } catch { setMsg('Could not read the receipt. Fill manually.') }
    finally { setOcring(false) }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">New expense</h1>
      {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
      {msg && <div className="text-sm text-green-700 mb-2">{msg}</div>}

      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-4 grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span>Date</span>
            <input type="date" className="border rounded-xl px-3 py-2" value={spendDate} onChange={e=>setSpendDate(e.target.value)} />
          </label>

          <label className="grid gap-1 text-sm">
            <span>Category</span>
            <select className="border rounded-xl px-3 py-2" value={category} onChange={e=>setCategory(e.target.value)}>
              <option>Food</option><option>Travel</option><option>Hotel</option><option>Fuel</option><option>Other</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          <span>Description</span>
          <input className="border rounded-xl px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" />
        </label>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="grid gap-1 text-sm">
            <span>Amount</span>
            <input type="number" step="0.01" className="border rounded-xl px-3 py-2" value={amount} onChange={e=>setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Currency</span>
            <select className="border rounded-xl px-3 py-2" value={currency} onChange={e=>setCurrency(e.target.value)}>
              <option>INR</option><option>USD</option><option>EUR</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>Paid by (optional)</span>
            <input className="border rounded-xl px-3 py-2" value={paidBy} onChange={e=>setPaidBy(e.target.value)} placeholder="Card / Cash / UPI" />
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          <span>Remarks (optional)</span>
          <input className="border rounded-xl px-3 py-2" value={remarks} onChange={e=>setRemarks(e.target.value)} />
        </label>

        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span>Receipt (image)</span>
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
          </label>
          <button type="button" onClick={runOCR} disabled={!file || ocring} className="rounded-xl border px-4 py-2">
            {ocring ? 'Reading…' : 'Fill using OCR'}
          </button>
        </div>

        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl bg-blue-600 text-white px-4 py-2">{saving ? 'Saving…' : 'Save expense'}</button>
          <button type="button" onClick={()=>history.back()} className="rounded-xl border px-4 py-2">Cancel</button>
        </div>
      </form>
    </div>
  )
}
