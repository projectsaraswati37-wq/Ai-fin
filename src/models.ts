export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  categoryId: string
  note?: string
  date: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  system: boolean
  createdAt: string
}

export const defaultCategories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍜', system: true, createdAt: '2026-01-01' },
  { id: 'investment', name: 'Investment', icon: '↗', system: true, createdAt: '2026-01-01' },
  { id: 'other', name: 'Other', icon: '✦', system: true, createdAt: '2026-01-01' },
]