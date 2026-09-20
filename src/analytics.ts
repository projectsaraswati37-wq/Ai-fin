import type { Category, Transaction } from './models'

export function totalFor(transactions: Transaction[], type: Transaction['type']) {
  return transactions.filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0)
}

export function categoryTotal(transactions: Transaction[], categoryId: string) {
  return totalFor(transactions.filter((transaction) => transaction.categoryId === categoryId), 'expense')
}

export function categoryTotals(transactions: Transaction[], categories: Category[]) {
  return categories.map((category) => ({ ...category, amount: categoryTotal(transactions, category.id) }))
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function monthTransactions(transactions: Transaction[], date = new Date()) {
  const month = date.getMonth()
  const year = date.getFullYear()
  return transactions.filter((transaction) => {
    const transactionDate = new Date(`${transaction.date}T00:00:00`)
    return transactionDate.getMonth() === month && transactionDate.getFullYear() === year
  })
}