export type Role = 'admin' | 'manager' | 'employee'

export interface Company {
  id: number
  name: string
  currency: string
  country?: string
}

export interface User {
  id: number
  email: string
  name?: string
  role: Role
  companyId?: number
  managerId?: number | null
}

export interface LoginResponse {
  token: string
  resetRequired?: boolean
  user: User
  company: Company
}

export type ExpenseStatus = 'draft' | 'submitted' | 'waiting' | 'approved' | 'rejected'

export interface Expense {
  id: number
  employeeId: number
  description: string
  category: string
  spendDate: string // ISO
  paidBy?: string
  remarks?: string
  amount: number
  currency: string
  amountCompanyCcy: number
  status: ExpenseStatus
}

export interface ApprovalTask {
  id: number
  expenseId: number
  stepOrder: number
  decision: 'pending' | 'approved' | 'rejected'
  comment?: string
  createdAt: string
  amountCompanyCcy: number
  companyCurrency: string
  submittedCurrency: string
  ownerName: string
  category: string
}

export interface ApprovalFlow {
  id: number
  name: string
  description?: string
  isManagerFirst: boolean
  sequenceEnabled: boolean
  approvers: { userId: number; required: boolean }[]
  percentThreshold?: number // e.g., 60
  specificApproverId?: number // e.g., CFO
}

export interface SignupPayload {
  name: string
  companyName: string
  country: string
  currency: string
  email: string
  password: string
}

export interface ApprovalEvent {
  at: string            // ISO timestamp
  byUserId: number
  decision: 'submitted' | 'approved' | 'rejected' | 'comment'
  comment?: string
}

export interface ExpenseDetail extends Expense {
  timeline: ApprovalEvent[]
}

export interface BasicOk { ok: true }
