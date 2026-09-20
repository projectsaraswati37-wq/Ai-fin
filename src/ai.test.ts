import { describe, expect, it, vi } from 'vitest'
import { askAi, type AiConfig } from './ai'

const config: AiConfig = { provider: 'openrouter', apiKey: 'test-key', model: 'test-model', baseUrl: 'https://example.test/v1' }

describe('AI provider requests', () => {
  it('normalizes OpenAI-compatible provider responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: 'You spent ₹500.' } }] }), { status: 200 })))
    await expect(askAi(config, 'How much did I spend?', { period: 'September 2026', balance: 1000, totalIncome: 2000, totalExpenses: 1000, totalInvestment: 200, categoryTotals: { Food: 500 }, largestTransactions: [] })).resolves.toBe('You spent ₹500.')
  })

  it('returns a useful error for provider failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })))
    await expect(askAi(config, 'Hello', { period: 'September 2026', balance: 0, totalIncome: 0, totalExpenses: 0, totalInvestment: 0, categoryTotals: {}, largestTransactions: [] })).rejects.toThrow('AI request failed (401)')
  })
})