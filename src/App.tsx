import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight, Brain, Check, ChevronRight, CirclePlus, Home, KeyRound, LineChart, Plus, Send, Settings, Sparkles, WalletCards, X } from 'lucide-react'
import { categoryTotals, formatINR, monthTransactions, totalFor } from './analytics'
import { askAi, providerDefaults, testAiConnection, type AiConfig, type AiProvider, type FinancialAiContext } from './ai'
import { addTransaction, loadCategories, loadTransactions } from './storage'
import type { Transaction, TransactionType } from './models'

type View = 'home' | 'analytics' | 'ai'
type Screen = View | 'settings'

function App() {
  const [view, setView] = useState<Screen>('home')
  const [history, setHistory] = useState<Screen[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions)
  const [showEntry, setShowEntry] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [notice, setNotice] = useState('')
  const [aiConfig, setAiConfig] = useState<AiConfig>({ provider: 'gemini', apiKey: '', model: providerDefaults.gemini.model })
  const categories = loadCategories()
  const currentMonth = monthTransactions(transactions)
  const income = totalFor(currentMonth, 'income')
  const spending = totalFor(currentMonth, 'expense')
  const balance = totalFor(transactions, 'income') - totalFor(transactions, 'expense')
  const categoryData = categoryTotals(currentMonth, categories)

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const next = event.state?.screen as Screen | undefined
      setView(next ?? 'home')
      setHistory((current) => current.slice(0, -1))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function saveTransaction(amount: number, type: TransactionType, categoryId: string) {
    const transaction: Transaction = {
      id: crypto.randomUUID(), amount, type, categoryId,
      date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString(),
    }
    addTransaction(transaction)
    setTransactions(loadTransactions())
    setShowEntry(false)
    setShowActions(false)
    setNotice(`${type === 'income' ? 'Income' : 'Expense'} added`)
    window.setTimeout(() => setNotice(''), 2600)
  }

  function navigate(next: Screen) {
    if (next === view) return
    setHistory((current) => [...current, view])
    setView(next)
    window.history.pushState({ screen: next }, '', `#${next}`)
  }

  function goBack() {
    const previous = history.at(-1)
    if (previous) {
      window.history.back()
    } else {
      setView('home')
    }
  }

  function updateProvider(provider: AiProvider) {
    setAiConfig((current) => ({ ...current, provider, model: providerDefaults[provider].model, baseUrl: providerDefaults[provider].baseUrl }))
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark"><WalletCards size={18} /></span><span>monee</span></div><div className="top-actions">{view !== 'home' && <button className="icon-button" onClick={goBack} aria-label="Go back"><ArrowLeft size={18} /></button>}<button className="avatar" onClick={() => navigate('settings')} aria-label="Open settings">AS</button></div></header>
    <main>
      {view === 'home' && <Dashboard balance={balance} income={income} spending={spending} categoryData={categoryData} transactionCount={transactions.length} onAdd={() => setShowActions(true)} onCategory={() => navigate('analytics')} />}
      {view === 'analytics' && <Analytics transactions={transactions} categories={categories} />}
      {view === 'ai' && <AiView transactionCount={transactions.length} transactions={transactions} categories={categories} config={aiConfig} aiReady={Boolean(aiConfig.apiKey)} onSettings={() => navigate('settings')} />}
      {view === 'settings' && <SettingsView config={aiConfig} onChange={setAiConfig} onProvider={updateProvider} onBack={goBack} onDisconnect={() => setAiConfig((current) => ({ ...current, apiKey: '' }))} />}
    </main>
    <nav className="bottom-nav" aria-label="Primary navigation">
      <NavButton active={view === 'home'} icon={<Home size={19} />} label="Home" onClick={() => navigate('home')} />
      <NavButton active={view === 'analytics'} icon={<LineChart size={19} />} label="Analytics" onClick={() => navigate('analytics')} />
      <NavButton active={view === 'ai'} icon={<Brain size={19} />} label="AI" onClick={() => navigate('ai')} />
    </nav>
    {showActions && <ActionSheet onClose={() => setShowActions(false)} onSpend={() => { setShowEntry(true); setShowActions(false) }} onIncome={() => { setShowEntry(true); setShowActions(false) }} onAsk={() => { setView('ai'); setShowActions(false) }} />}
    {showEntry && <EntrySheet categories={categories} onClose={() => setShowEntry(false)} onSave={saveTransaction} />}
    {notice && <div className="toast"><CirclePlus size={16} /> {notice}</div>}
  </div>
}

function Dashboard({ balance, income, spending, categoryData, transactionCount, onAdd, onCategory }: { balance: number; income: number; spending: number; categoryData: Array<{ id: string; name: string; icon: string; amount: number }>; transactionCount: number; onAdd: () => void; onCategory: () => void }) {
  const today = new Date()
  return <div className="page dashboard-page">
    <section className="welcome"><div><p className="eyebrow">{today.toLocaleDateString('en-IN', { weekday: 'long' })} · {today.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p><h1>Good morning, A.</h1></div><span className="week-chip">Week {Math.ceil(today.getDate() / 7)}</span></section>
    <section className="balance-panel"><div className="panel-label">Current balance <span className="live-dot" /></div><strong>{formatINR(balance)}</strong><div className="balance-meta"><span><ArrowUpRight size={15} /> Tracking locally</span><span>{transactionCount} entries</span></div></section>
    <section className="metric-grid"><Metric label="Income this month" value={income} tone="green" /><Metric label="Spending this month" value={spending} tone="coral" /><Metric label="Investments" value={categoryData.find((category) => category.id === 'investment')?.amount ?? 0} tone="blue" /></section>
    <section className="section-heading"><div><p className="eyebrow">This month</p><h2>Where your money goes</h2></div><button className="text-button" onClick={onCategory}>See analytics <ChevronRight size={15} /></button></section>
    <section className="category-list">{categoryData.map((category) => <button className="category-row" key={category.id} onClick={onCategory}><span className={`category-icon ${category.id}`}>{category.icon}</span><span className="category-name">{category.name}<small>{category.amount ? 'Spending' : 'No entries yet'}</small></span><strong>{formatINR(category.amount)}</strong><ChevronRight size={17} /></button>)}</section>
    {!transactionCount && <div className="empty-note"><Sparkles size={18} /><span>Add your first transaction to start understanding your money.</span></div>}
    <button className="floating-add" onClick={onAdd} aria-label="Add transaction"><Plus size={25} /></button>
  </div>
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) { return <div className="metric"><span className={`metric-dot ${tone}`} /><small>{label}</small><strong>{formatINR(value)}</strong></div> }
function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) { return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span></button> }

function Analytics({ transactions, categories }: { transactions: Transaction[]; categories: ReturnType<typeof loadCategories> }) {
  const month = monthTransactions(transactions)
  const totals = categoryTotals(month, categories)
  const max = Math.max(...totals.map((entry) => entry.amount), 1)
  return <div className="page"><section className="page-heading"><p className="eyebrow">Financial overview</p><h1>Analytics</h1><p>Simple signals from your real transaction history.</p></section><div className="analytics-summary"><Metric label="Balance" value={totalFor(transactions, 'income') - totalFor(transactions, 'expense')} tone="blue" /><Metric label="Total income" value={totalFor(month, 'income')} tone="green" /><Metric label="Total spending" value={totalFor(month, 'expense')} tone="coral" /></div><section className="chart-panel"><div className="section-heading"><div><p className="eyebrow">Distribution</p><h2>Monthly spending</h2></div><span className="period-pill">Current month</span></div>{month.length ? <div className="bars">{totals.map((item) => <div className="bar-item" key={item.id}><div className="bar-track"><div className={`bar-fill ${item.id}`} style={{ height: `${Math.max(item.amount ? 10 : 2, item.amount / max * 100)}%` }} /></div><span>{item.icon}</span><small>{item.name}</small><strong>{formatINR(item.amount)}</strong></div>)}</div> : <div className="empty-chart"><LineChart size={24} /><span>Your charts will appear after you add transactions.</span></div>}</section></div>
}

function AiView({ transactionCount, transactions, categories, config, aiReady, onSettings }: { transactionCount: number; transactions: Transaction[]; categories: ReturnType<typeof loadCategories>; config: AiConfig; aiReady: boolean; onSettings: () => void }) {
  const [mode, setMode] = useState<'ask' | 'insights'>('ask')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const month = monthTransactions(transactions)
  const totals = categoryTotals(month, categories)
  const context: FinancialAiContext = {
    period: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    balance: totalFor(transactions, 'income') - totalFor(transactions, 'expense'),
    totalIncome: totalFor(month, 'income'),
    totalExpenses: totalFor(month, 'expense'),
    totalInvestment: totals.find((category) => category.id === 'investment')?.amount ?? 0,
    categoryTotals: Object.fromEntries(totals.map((category) => [category.name, category.amount])),
    largestTransactions: [...month].sort((a, b) => b.amount - a.amount).slice(0, 5).map((transaction) => ({ amount: transaction.amount, type: transaction.type, category: categories.find((category) => category.id === transaction.categoryId)?.name ?? 'Other', date: transaction.date })),
  }
  async function submit(nextQuestion = question) {
    if (!nextQuestion.trim() || !aiReady) return
    setLoading(true); setError(''); setAnswer('')
    try { setAnswer(await askAi(config, nextQuestion.trim(), context)) } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'AI insights are temporarily unavailable.') } finally { setLoading(false) }
  }
  return <div className="page ai-page"><section className="page-heading ai-heading"><span className="ai-orb"><Sparkles size={20} /></span><p className="eyebrow">Your money, explained</p><h1>{mode === 'ask' ? 'Ask Money' : 'AI Insights'}</h1><p>{mode === 'ask' ? 'Ask a question about your real financial activity.' : 'A concise read on the patterns in your financial activity.'}</p></section><div className="ai-tabs"><button className={mode === 'ask' ? 'selected' : ''} onClick={() => { setMode('ask'); setAnswer(''); setError('') }}>Ask Money</button><button className={mode === 'insights' ? 'selected' : ''} onClick={() => { setMode('insights'); setQuestion('Give me a concise weekly briefing with facts first, then two useful observations.'); setAnswer(''); setError('') }}>Insights</button></div>{!aiReady && <button className="provider-banner" onClick={onSettings}><KeyRound size={17} /><span><b>Connect an AI provider</b><small>Choose Gemini, OpenRouter, or Groq in Settings</small></span><ChevronRight size={17} /></button>}{!transactionCount ? <div className="ai-empty"><Brain size={25} /><h2>Your insights are waiting</h2><p>Add a few transactions first. Then I can help you understand your spending patterns.</p></div> : <><div className="ask-box"><input value={mode === 'insights' ? 'Generate my financial briefing' : question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void submit() }} placeholder="Ask about your money..." aria-label="Ask about your money" disabled={!aiReady || loading || mode === 'insights'} /><button aria-label={mode === 'insights' ? 'Generate insights' : 'Send question'} onClick={() => void submit(mode === 'insights' ? question : undefined)} disabled={!aiReady || loading}>{loading ? '...' : <Send size={18} />}</button></div>{answer && <div className="ai-answer"><p className="eyebrow">{mode === 'insights' ? 'AI briefing' : 'Answer'}</p>{answer.split('\n').filter(Boolean).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div>}{error && <div className="ai-error"><Brain size={17} /><span>{error}</span></div>}</>}{mode === 'ask' && <div className="suggestions"><span>Try asking</span>{['Food this month', 'Biggest expenses', 'Where did most of my money go?', 'How much did I invest?'].map((suggestion) => <button key={suggestion} onClick={() => { setQuestion(suggestion); void submit(suggestion) }} disabled={!aiReady || loading}>{suggestion}</button>)}</div>}</div>
}

function SettingsView({ config, onChange, onProvider, onBack, onDisconnect }: { config: AiConfig; onChange: (config: AiConfig) => void; onProvider: (provider: AiProvider) => void; onBack: () => void; onDisconnect: () => void }) {
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle')
  const [message, setMessage] = useState('')
  async function connect() { setStatus('testing'); setMessage(''); try { await testAiConnection(config); setStatus('connected'); setMessage('Connection successful. Key stays in this session only.') } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'Connection failed.') } }
  return <div className="page settings-page"><section className="settings-heading"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back</button><Settings size={22} /><p className="eyebrow">Local session settings</p><h1>Connect AI</h1><p>Keys are held in memory only and are cleared when this session ends.</p></section><section className="settings-panel"><label className="field-label">Provider</label><div className="provider-tabs">{(['gemini', 'openrouter', 'groq'] as AiProvider[]).map((provider) => <button key={provider} className={config.provider === provider ? 'selected' : ''} onClick={() => { onProvider(provider); setStatus('idle'); setMessage('') }}>{providerDefaults[provider].label}</button>)}</div><label className="field-label" htmlFor="api-key">API key</label><input id="api-key" className="settings-input" type="password" autoComplete="off" value={config.apiKey} onChange={(event) => { onChange({ ...config, apiKey: event.target.value }); setStatus('idle') }} placeholder={`Paste your ${providerDefaults[config.provider].label} key`} /><label className="field-label" htmlFor="model">Model</label><input id="model" className="settings-input" value={config.model} onChange={(event) => onChange({ ...config, model: event.target.value })} /><label className="field-label" htmlFor="base-url">Base URL</label><input id="base-url" className="settings-input" value={config.baseUrl ?? ''} onChange={(event) => onChange({ ...config, baseUrl: event.target.value })} /><button className="primary-button" onClick={connect} disabled={status === 'testing'}>{status === 'testing' ? 'Testing connection...' : 'Test connection'} <Check size={17} /></button>{message && <p className={`connection-message ${status}`}>{message}</p>}{status === 'connected' && <button className="disconnect-button" onClick={() => { onDisconnect(); setStatus('idle'); setMessage('Disconnected. The key was removed from memory.') }}>Disconnect provider</button>}</section><p className="privacy-note"><KeyRound size={15} /> Development/local use only. For production, provider requests must go through a server-side proxy.</p></div>
}

function ActionSheet({ onClose, onSpend, onIncome, onAsk }: { onClose: () => void; onSpend: () => void; onIncome: () => void; onAsk: () => void }) { return <div className="scrim" onClick={onClose}><div className="action-sheet" onClick={(event) => event.stopPropagation()}><div className="sheet-top"><div><p className="eyebrow">Quick action</p><h2>What are you doing?</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="action-grid"><button onClick={onSpend}><span className="action-icon coral">−</span><b>Spend</b><small>Record an expense</small></button><button onClick={onIncome}><span className="action-icon green">+</span><b>Income</b><small>Add money received</small></button><button className="ask-action" onClick={onAsk}><Sparkles size={18} /><b>Ask Money</b><small>Explore your patterns</small></button></div></div></div> }

function EntrySheet({ categories, onClose, onSave }: { categories: ReturnType<typeof loadCategories>; onClose: () => void; onSave: (amount: number, type: TransactionType, categoryId: string) => void }) { const [amount, setAmount] = useState(''); const [type, setType] = useState<TransactionType>('expense'); const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 'other'); const [error, setError] = useState(''); function submit() { const value = Number(amount); if (!amount || !Number.isFinite(value) || value <= 0) { setError('Please enter a valid amount.'); return } onSave(value, type, categoryId) } return <div className="scrim" onClick={onClose}><div className="entry-sheet" onClick={(event) => event.stopPropagation()}><div className="sheet-top"><div><p className="eyebrow">New transaction</p><h2>Capture the moment</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><label className="amount-field"><span>₹</span><input autoFocus inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setError('') }} placeholder="0" aria-label="Amount" /></label>{error && <p className="form-error">{error}</p>}<div className="segmented"><button className={type === 'expense' ? 'selected' : ''} onClick={() => setType('expense')}>Spend</button><button className={type === 'income' ? 'selected' : ''} onClick={() => setType('income')}>Income</button></div><div className="entry-categories">{categories.map((category) => <button key={category.id} className={categoryId === category.id ? 'selected' : ''} onClick={() => setCategoryId(category.id)}><span>{category.icon}</span>{category.name}</button>)}</div><button className="primary-button" onClick={submit}>Add transaction <ArrowUpRight size={17} /></button></div></div> }

export default App