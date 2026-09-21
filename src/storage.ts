import { defaultCategories, type Category, type Transaction } from './models'

const transactionKey = 'ai-fin.transactions'
const categoryKey = 'ai-fin.categories'

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function loadTransactions(): Transaction[] { return read<Transaction[]>(transactionKey, []) }
export function saveTransactions(transactions: Transaction[]) { localStorage.setItem(transactionKey, JSON.stringify(transactions)) }
export function loadCategories(): Category[] { return read<Category[]>(categoryKey, defaultCategories) }
export function addTransaction(transaction: Transaction) { saveTransactions([transaction, ...loadTransactions()]) }
export function deleteTransaction(id: string) { saveTransactions(loadTransactions().filter((transaction) => transaction.id !== id)) }