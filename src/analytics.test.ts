import { describe, expect, it } from 'vitest'
import { categoryTotal, monthTransactions, totalFor } from './analytics'
import type { Transaction } from './models'

const transactions: Transaction[] = [
  { id: 'income', amount: 25000, type: 'income', categoryId: 'other', date: '2026-09-02', createdAt: '2026-09-02T09:00:00Z' },
  { id: 'food', amount: 350.5, type: 'expense', categoryId: 'food', date: '2026-09-03', createdAt: '2026-09-03T09:00:00Z' },
  { id: 'investment', amount: 4000, type: 'expense', categoryId: 'investment', date: '2026-09-04', createdAt: '2026-09-04T09:00:00Z' },
  { id: 'old', amount: 900, type: 'expense', categoryId: 'food', date: '2026-08-30', createdAt: '2026-08-30T09:00:00Z' },
]

describe('financial calculations', () => {
  it('separates income and expenses', () => {
    expect(totalFor(transactions, 'income')).toBe(25000)
    expect(totalFor(transactions, 'expense')).toBe(5250.5)
  })

  it('filters transactions to the selected month', () => {
    expect(monthTransactions(transactions, new Date('2026-09-15'))).toHaveLength(3)
  })

  it('calculates category expense totals only', () => {
    expect(categoryTotal(transactions, 'food')).toBe(1250.5)
    expect(categoryTotal(transactions, 'other')).toBe(0)
  })
})