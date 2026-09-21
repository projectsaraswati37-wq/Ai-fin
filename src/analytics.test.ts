import { describe, expect, it } from 'vitest'
import { categoryTotal, detailTotals, monthTransactions, spendingTotal, totalFor } from './analytics'
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

  it('keeps investments out of ordinary spending while reducing cash balance', () => {
    expect(spendingTotal(transactions)).toBe(1250.5)
    expect(totalFor(transactions, 'expense')).toBe(5250.5)
  })

  it('groups entries by their purpose or source', () => {
    const detailed = transactions.map((transaction) => ({ ...transaction, details: transaction.id === 'income' ? 'Salary' : 'Lunch' }))
    expect(detailTotals(detailed, [{ id: 'food', name: 'Food', icon: 'x', system: true, createdAt: '2026-01-01' }])).toEqual([{ name: 'Salary', amount: 25000 }, { name: 'Lunch', amount: -5250.5 }])
  })
})