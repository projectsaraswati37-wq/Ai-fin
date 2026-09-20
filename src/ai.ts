export type AiProvider = 'gemini' | 'openrouter' | 'groq'

export interface AiConfig {
  provider: AiProvider
  apiKey: string
  model: string
  baseUrl?: string
}

export const providerDefaults: Record<AiProvider, { label: string; model: string; baseUrl: string }> = {
  gemini: { label: 'Gemini', model: 'gemini-2.0-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  openrouter: { label: 'OpenRouter', model: 'openai/gpt-4o-mini', baseUrl: 'https://openrouter.ai/api/v1' },
  groq: { label: 'Groq', model: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' },
}

interface ProviderResponse {
  choices?: Array<{ message?: { content?: string } }>
}

export interface FinancialAiContext {
  period: string
  balance: number
  totalIncome: number
  totalExpenses: number
  totalInvestment: number
  categoryTotals: Record<string, number>
  largestTransactions: Array<{ amount: number; type: string; category: string; date: string }>
}

export async function testAiConnection(config: AiConfig): Promise<string> {
  if (!config.apiKey.trim()) throw new Error('Enter an API key first.')
  const prompt = 'Reply with exactly: Connection successful.'
  const baseUrl = config.baseUrl?.replace(/\/$/, '') || providerDefaults[config.provider].baseUrl
  let response: Response

  if (config.provider === 'gemini') {
    response = await fetch(`${baseUrl}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })
  } else {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }], max_tokens: 20 }),
    })
  }

  if (!response.ok) throw new Error(`Connection failed (${response.status}). Check the provider, model, and key.`)
  const payload = await response.json() as ProviderResponse & { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  const message = config.provider === 'gemini'
    ? payload.candidates?.[0]?.content?.parts?.[0]?.text
    : payload.choices?.[0]?.message?.content
  if (!message) throw new Error('The provider returned an unexpected response.')
  return message
}

export async function askAi(config: AiConfig, question: string, context: FinancialAiContext): Promise<string> {
  if (!config.apiKey.trim()) throw new Error('Connect an AI provider in Settings first.')
  const system = 'You are a concise personal finance explainer. Use only the supplied financial context. Do not invent transactions or metrics. The application owns all calculations. Distinguish facts from observations. Return plain text, with a direct answer first.'
  const prompt = `${system}\n\nFinancial context:\n${JSON.stringify(context)}\n\nUser question: ${question}`
  const baseUrl = config.baseUrl?.replace(/\/$/, '') || providerDefaults[config.provider].baseUrl
  let response: Response

  if (config.provider === 'gemini') {
    response = await fetch(`${baseUrl}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })
  } else {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 350 }),
    })
  }

  if (!response.ok) throw new Error(`AI request failed (${response.status}). Your financial data is still available.`)
  const payload = await response.json() as ProviderResponse & { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  const message = config.provider === 'gemini'
    ? payload.candidates?.[0]?.content?.parts?.[0]?.text
    : payload.choices?.[0]?.message?.content
  if (!message?.trim()) throw new Error('The AI provider returned an empty response.')
  return message.trim()
}