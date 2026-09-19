# Money Manager — MVP Product & Engineering Specification

## 0. Document Purpose

This document is the implementation specification for a coding agent.

Build a mobile-first personal finance application focused on:

> **Minimum input → maximum financial understanding.**

The MVP must prioritize extremely fast transaction entry, simple visual financial understanding, and an AI layer that explains/querys structured financial data.

Do **not** expand the scope beyond this specification unless explicitly instructed.

---

# 1. Product Definition

## Product

A mobile-first personal finance manager where users can:

1. Record income and expenses in under 10 seconds.
2. Organize transactions into simple categories.
3. View balance and spending through clear visualizations.
4. Inspect category-level financial activity.
5. Ask natural-language questions about their financial data.
6. Receive AI-generated summaries and pattern insights.

## Core product loop

```text
Record → Categorize → Understand → Act
```

## Primary product hypothesis

> Users can record and understand their money movement faster and with less cognitive effort than with conventional expense trackers.

## Core UX principle

Every screen must minimize the amount of thinking required.

---

# 2. MVP Scope

The MVP contains exactly these core modules:

1. Dashboard
2. Add Transaction
3. Transaction Confirmation
4. Overall Analytics
5. Category Detail
6. AI Insights
7. Ask Money

Do not add banking integrations, UPI integrations, SMS parsing, stock brokerage integrations, complex budgeting, or other advanced features in the initial MVP.

---

# 3. Recommended Technical Architecture

Use a clean modular architecture.

```text
                    FRONTEND
              Mobile-first Web UI
                       |
                       v
               Application Logic
                       |
          +------------+------------+
          |                         |
          v                         v
   Transaction Store         Analytics Engine
          |                         |
          +------------+------------+
                       |
                Structured Data
                       |
                       v
                  AI Gateway
                  OpenRouter
                       |
                       v
                  AI Model
```

## Critical architecture rule

**AI is an intelligence layer, not the source of financial truth.**

The application itself must calculate:

- balance
- income totals
- expense totals
- category totals
- percentages
- comparisons
- chart data
- transaction aggregations

The AI only receives structured, calculated information and produces explanations, summaries, suggestions, and natural-language answers.

Never allow an LLM to become the authoritative financial calculator.

---

# 4. Technology Constraints

Use a lightweight, maintainable stack suitable for a mobile-first application.

Recommended:

- React
- TypeScript
- Vite
- Tailwind CSS
- Local persistence for MVP
- Recharts or equivalent lightweight chart library
- OpenRouter for AI
- Environment variables for API configuration

If the existing project already has a working stack, preserve it rather than unnecessarily replacing it.

## MVP storage

Use browser/device-local persistence initially.

Recommended abstraction:

```text
storage/
  transactionStore
  settingsStore
  categoryStore
```

The storage layer must be isolated so a real backend/database can be introduced later without rewriting the UI.

---

# 5. Data Model

## Transaction

```ts
type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note?: string;
  date: string;
  createdAt: string;
}
```

## Category

```ts
interface Category {
  id: string;
  name: string;
  icon: string;
  system: boolean;
  createdAt: string;
}
```

Initial categories:

```text
food
investment
other
```

## Default categories

### Food

Used for:

- restaurants
- snacks
- groceries
- coffee
- food delivery
- meals

### Investment

Used for:

- investments
- savings/investment contributions
- other intentionally classified investment activity

### Other

Used for transactions that do not fit the initial categories.

Do not create dozens of categories.

---

# 6. Dynamic Category System

The MVP must support category expansion, but AI must not silently modify the user's financial structure.

## Rule

AI can suggest a new category.

The user must approve it.

Example:

```text
Other
₹500 → Friend
₹700 → Friend
₹300 → Friend
₹600 → Friend
₹400 → Friend
```

AI suggestion:

> You frequently record transfers to friends. Create a separate "Friends & Transfers" category?

Buttons:

```text
[ Create Category ]
[ Not Now ]
```

If approved:

```text
Food
Investment
Friends & Transfers
Other
```

## Principle

> AI suggests structure; the user controls structure.

---

# 7. Global Navigation

The application should use a simple navigation model.

Recommended:

```text
Home
Analytics
AI
```

The transaction action must remain globally accessible through a prominent `+` action.

Avoid navigation with excessive menu depth.

---

# 8. Screen 01 — Dashboard

## Purpose

Answer:

> "Where am I financially?"

## Layout

Top section:

```text
Current Time
Current Date
Week information
```

Main financial snapshot:

```text
Current Balance
Income This Month
Spending This Month
Investment This Month
```

Category overview:

```text
Food
Investment
Other
```

Each category card should show:

- icon
- category name
- amount
- optional percentage
- small visual trend

Primary action:

```text
+
```

## Dashboard interaction

Pressing `+` opens a compact action menu:

```text
What do you want to do?

[ Spend ]
[ Income ]

[ Ask Money ]
```

The action menu should appear as a small bottom sheet, popover, or compact floating menu.

Do not open a complicated navigation screen.

---

# 9. Screen 02 — Add Transaction

## Purpose

Record a transaction in ≤10 seconds.

This is the most important screen in the MVP.

## Required interaction

The user must be able to complete:

```text
Amount
+
Transaction type
+
Category
+
Save
```

without filling a long form.

## Visual concept

```text
                 ₹

               350

        ← SPEND     INCOME →

       🍔 Food
       📈 Investment
       📦 Other

           [ Add Transaction ]
```

## Amount

Large numeric input.

Default currency:

```text
INR (₹)
```

The interface should make the amount the visual focus.

## Transaction type

Support:

```text
Expense
Income
```

Recommended visual interaction:

```text
← SPEND             INCOME →
```

A swipe gesture may be supported, but it must not be the only way to switch the type.

Always provide an explicit accessible control.

## Category

Show the initial categories as large clickable controls:

```text
🍔 Food
📈 Investment
📦 Other
```

Do not require opening another page to choose the category.

## Save

Primary button:

```text
Add Transaction
```

After successful save:

- persist transaction
- update balance
- update analytics
- show confirmation
- return to the previous context or dashboard

---

# 10. Transaction Entry UX Rules

The transaction screen must follow these rules:

1. Amount input receives primary visual focus.
2. Avoid unnecessary fields.
3. Do not ask for payment method in MVP.
4. Do not ask for merchant in MVP.
5. Do not require notes.
6. Date defaults to today.
7. User may optionally change date.
8. Category selection must be visible.
9. Income/expense must be obvious.
10. Save must be one clear action.
11. Validation must be immediate and understandable.

## Validation

Reject:

- empty amount
- zero amount
- negative amount entered manually
- invalid numeric input

Allow:

- decimal values where appropriate
- large amounts

Display:

```text
Please enter a valid amount.
```

Do not expose technical errors to the user.

---

# 11. Screen 03 — Transaction Confirmation

After saving, show a compact confirmation.

Example:

```text
✓ Added

₹350
Food
Expense

[ Done ]
```

The confirmation should disappear quickly or allow immediate continuation.

Do not create an unnecessary full page for confirmation.

---

# 12. Screen 04 — Overall Analytics

## Purpose

Answer:

> "Where is my money going?"

Show:

### 1. Cash Flow

Income vs expenses over time.

### 2. Category Distribution

Example:

```text
Food          32%
Investment    25%
Other         43%
```

### 3. Balance Trajectory

Show balance changes over time.

### 4. Monthly Comparison

Example:

```text
             AUG       SEP

Food         ₹4,200    ₹5,100
Investment   ₹2,000    ₹4,000
Other        ₹3,100    ₹2,700
```

## Chart rules

Charts must be:

- readable on mobile
- visually simple
- interactive where useful
- labeled
- based on actual transaction data
- resilient when there is little or no data

Do not use decorative charts that do not communicate useful information.

---

# 13. Screen 05 — Category Detail

When the user taps a category, open a dedicated category page.

Example:

```text
FOOD

₹5,240
spent this month

[ Spending Chart ]

Average / Day
₹174

Largest Expense
₹1,200

Transactions
----------------
₹350   Restaurant
₹120   Snacks
₹80    Coffee
...
```

## Category page requirements

Show:

- category name
- current-period total
- chart
- average spending
- largest transaction
- transaction history
- basic comparison with previous period if enough data exists

The same component should support:

```text
Food
Investment
Other
AI-created categories
```

Do not create separate hardcoded page implementations for each category.

---

# 14. Screen 06 — AI Insights

## Purpose

Answer:

> "What does my financial data mean?"

This is not a generic chatbot.

The AI Insights screen should provide concise, visually structured observations.

## Example insight types

### Spending anomaly

```text
Food spending is 28% higher
than your recent weekly average.
```

### Pattern

```text
Most of your food spending
occurs between Friday and Sunday.
```

### Category suggestion

```text
You frequently record transfers
to friends.

Create a "Friends & Transfers" category?
```

### Weekly briefing

```text
THIS WEEK

Income       ₹8,000
Spending     ₹4,200
Investment   ₹1,500

AI SUMMARY

Food spending increased 18%.
Your investment contribution increased.
Your largest expense was ₹1,200.
```

## AI output requirements

AI output must:

- be concise
- reference actual structured data
- distinguish facts from observations
- avoid inventing transactions
- avoid inventing financial metrics
- avoid pretending to have access to unavailable data

---

# 15. Screen 07 — Ask Money

Rename the generic concept "AI Search" to:

# Ask Money

Purpose:

Allow natural-language queries against the user's structured financial data.

Examples:

```text
How much did I spend on food this month?

Where did most of my money go?

Show my biggest expenses.

Compare this month with last month.

What categories increased?

How much did I invest this month?
```

## UX

Show a large input:

```text
Ask about your money...

[ Send ]
```

Provide suggested queries below it.

Example:

```text
[ Food this month ]
[ Biggest expenses ]
[ Compare months ]
[ Investment ]
```

## Response format

The AI should provide:

1. Direct answer
2. Relevant number(s)
3. Short explanation
4. Optional supporting transaction/category context

Example:

```text
You spent ₹5,240 on food this month.

That's ₹820 more than last month,
an increase of approximately 18.6%.
```

The percentage must be calculated by application logic, not guessed by the model.

---

# 16. AI Architecture

## Principle

The application owns the financial truth.

The AI interprets structured data.

Never send an uncontrolled dump of application state to the model.

Create structured AI context.

Example:

```ts
interface FinancialContext {
  period: string;
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  categoryTotals: Record<string, number>;
  previousPeriod?: {
    totalIncome: number;
    totalExpenses: number;
    categoryTotals: Record<string, number>;
  };
  largestTransactions: Transaction[];
}
```

The AI receives only the context required for the current task.

---

# 17. AI Gateway

Use:

```text
Application
    |
    v
AI Service
    |
    v
OpenRouter
    |
    v
Configured model
```

The model should be configurable through an environment variable.

Example:

```text
AI_MODEL=...
OPENROUTER_API_KEY=...
```

Never hardcode API keys.

Never expose API keys in client-side source code.

If the current architecture is purely client-side, use a secure server-side/proxy layer for production API access.

---

# 18. AI Tasks

Implement AI capabilities as separate functions.

Conceptually:

```ts
generateWeeklySummary()
answerFinancialQuestion()
detectPatterns()
suggestCategory()
```

Do not create one giant prompt responsible for the entire application.

---

# 19. Deterministic Financial Engine

Create a separate service/module responsible for calculations.

Conceptually:

```ts
calculateBalance()
calculateIncome()
calculateExpenses()
calculateInvestment()
calculateCategoryTotals()
calculateAverageDailySpend()
calculateLargestTransaction()
calculatePeriodComparison()
calculateCashFlow()
```

These functions must be deterministic and testable.

Example:

```text
balance = totalIncome - totalExpenses
```

Do not ask the AI to calculate this.

---

# 20. Empty States

The application must work when there are no transactions.

Dashboard example:

```text
No transactions yet.

Add your first transaction
to start understanding your money.

[ + Add Transaction ]
```

Analytics:

```text
Your financial charts will appear
after you add some transactions.
```

AI:

```text
Add a few transactions first.
Then I can help you understand
your spending patterns.
```

Do not display fake financial data as if it were real user data.

For development/demo mode, clearly separate seeded demo data from real data.

---

# 21. Responsive Design

Primary target:

**Mobile-first.**

The UI must also work on desktop widths.

Use responsive layouts rather than separate mobile and desktop applications.

## Mobile priorities

- large touch targets
- minimal typing
- clear hierarchy
- one-handed interaction where practical
- bottom sheets for compact actions
- avoid dense tables
- avoid tiny chart labels

---

# 22. Visual Design Direction

The UI should feel:

- modern
- calm
- premium
- data-focused
- visually immersive
- simple
- low cognitive load

Avoid:

- excessive gradients
- excessive animations
- too many cards
- unnecessary borders
- crowded dashboards
- tiny text
- overly complicated navigation

The application should look like a financial instrument, not an accounting spreadsheet.

---

# 23. Interaction Principles

## Principle 1 — Progressive disclosure

Show only what the user needs now.

## Principle 2 — Recognition over recall

Use visible category controls and suggested actions instead of requiring users to remember commands.

## Principle 3 — One primary action

Every screen should have one obvious next action.

## Principle 4 — Fast input

Minimize typing.

## Principle 5 — AI suggestion, human approval

AI may recommend changes but must not silently alter financial structure.

## Principle 6 — Data before AI

The financial engine must work without the AI.

---

# 24. MVP Success Metrics

Measure the product instead of merely claiming that it is easy to use.

## Transaction Entry Time

Target:

```text
≤ 10 seconds
```

Measured from tapping `+` to successful transaction creation.

## Other target metrics

```text
Find monthly spending       ≤ 5 seconds
Find category               ≤ 3 seconds
Understand weekly summary   ≤ 15 seconds
```

These are product targets, not guaranteed results.

The implementation should make them measurable during user testing.

---

# 25. Security and Privacy Baseline

Financial information is sensitive.

For the MVP:

- keep data local where possible
- do not log raw financial transactions unnecessarily
- never hardcode API keys
- never expose API keys in the browser bundle
- do not send more financial information to AI than required
- clearly distinguish local data from remote AI processing
- provide a way to clear local financial data

If AI processing requires sending financial context to an external model provider, make that architecture explicit in the UI/privacy documentation.

---

# 26. Out of Scope

Do NOT implement these in MVP unless explicitly requested:

```text
Bank account integration
UPI integration
SMS transaction parsing
Automatic receipt scanning
Stock brokerage integration
Cryptocurrency tracking
Loans
Credit scores
Insurance
Tax filing
Advanced budgeting
Bill payment
Financial product recommendations
Complex authentication
Multi-user finance
Family accounts
Cloud synchronization
Real-time banking
Voice assistant
Autonomous financial actions
```

These may become future roadmap items.

---

# 27. Future Roadmap

After the MVP proves the core UX:

## Phase 2

- recurring transactions
- custom categories
- richer filters
- merchant field
- payment method
- budgets
- recurring expenses

## Phase 3

- bank integrations
- UPI/SMS import
- receipt OCR
- cloud sync
- authentication
- multi-device support

## Phase 4

- advanced AI pattern detection
- personalized financial coaching
- predictive cash-flow visualization
- automated transaction categorization
- intelligent recurring-expense detection

AI should become more capable only after the underlying data model becomes reliable.

---

# 28. Development Order

Implement in this exact order.

## Step 1

Create application shell and responsive navigation.

## Step 2

Create transaction data model and local persistence.

## Step 3

Build Add Transaction screen.

## Step 4

Build deterministic financial calculation engine.

## Step 5

Build Dashboard.

## Step 6

Build Analytics.

## Step 7

Build reusable Category Detail screen.

## Step 8

Build AI Insights using structured financial context.

## Step 9

Build Ask Money.

## Step 10

Add dynamic category suggestions.

## Step 11

Add polish, animations, accessibility, error handling, and performance optimization.

---

# 29. Testing Requirements

Before considering the MVP complete, test:

## Transaction tests

- add expense
- add income
- invalid amount
- zero amount
- decimal amount
- large amount
- category selection
- transaction persistence
- transaction deletion/clear-data behavior

## Calculation tests

Verify:

```text
balance
income totals
expense totals
investment totals
category totals
averages
largest transaction
period comparison
```

Use deterministic test fixtures.

## AI tests

Test:

- no data
- small dataset
- normal dataset
- missing previous period
- ambiguous user question
- question unrelated to finances
- AI unavailable
- OpenRouter error
- malformed AI response

The application must remain functional if AI is unavailable.

---

# 30. Failure Behavior

If AI fails:

```text
AI insights are temporarily unavailable.

Your financial data and charts
are still available.
```

Do not block the rest of the application.

If local storage fails:

Show a clear recovery message.

Never silently lose a transaction.

If a transaction cannot be saved, do not display it as successfully saved.

---

# 31. Definition of Done

The MVP is complete only when:

- [ ] Dashboard works
- [ ] Current date/time displays correctly
- [ ] Income can be added
- [ ] Expenses can be added
- [ ] Categories work
- [ ] Transactions persist locally
- [ ] Balance is calculated deterministically
- [ ] Analytics are based on actual transaction data
- [ ] Category detail pages work dynamically
- [ ] Empty states work
- [ ] AI Insights work when AI is configured
- [ ] Ask Money works when AI is configured
- [ ] App remains usable when AI is unavailable
- [ ] API keys are not exposed in client source
- [ ] AI cannot directly modify financial records
- [ ] Dynamic categories require user approval
- [ ] Mobile UX is usable
- [ ] Basic accessibility is implemented
- [ ] Core calculation tests pass
- [ ] No fake financial data is presented as real user data

---

# 32. Coding Agent Instructions

You are implementing a product, not a visual mockup.

Before writing code:

1. Inspect the existing repository.
2. Identify the current framework and package manager.
3. Reuse the existing architecture where reasonable.
4. Do not replace working infrastructure without a reason.
5. Create a clear component/module structure.
6. Keep financial calculations independent from UI.
7. Keep AI integration independent from financial calculations.
8. Use TypeScript types throughout.
9. Avoid duplicated category-specific code.
10. Keep components small and reusable.

When implementing each feature:

1. Implement the smallest working version.
2. Verify it.
3. Then improve visual polish.
4. Do not add unrelated features.

Do not fabricate backend APIs.

Do not fabricate banking data.

Do not hardcode fake user transactions into the real application state.

---

# 33. Suggested Project Structure

Adapt this to the existing repository rather than blindly replacing the project.

```text
src/
├── components/
│   ├── dashboard/
│   ├── transactions/
│   ├── analytics/
│   ├── categories/
│   ├── ai/
│   └── common/
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   ├── CategoryDetail.tsx
│   ├── AIInsights.tsx
│   └── AskMoney.tsx
│
├── services/
│   ├── transactionService.ts
│   ├── analyticsService.ts
│   ├── aiService.ts
│   └── storageService.ts
│
├── models/
│   ├── transaction.ts
│   ├── category.ts
│   └── financialContext.ts
│
├── utils/
│   ├── currency.ts
│   ├── dates.ts
│   └── validation.ts
│
└── App.tsx
```

---

# 34. Final Product Philosophy

The product must not become an accounting application with an AI chatbot attached to it.

The correct hierarchy is:

```text
                 USER EXPERIENCE
                       │
                       ▼
                FAST TRANSACTIONS
                       │
                       ▼
              RELIABLE FINANCIAL DATA
                       │
                       ▼
                VISUAL UNDERSTANDING
                       │
                       ▼
                  AI INSIGHT
                       │
                       ▼
                BETTER DECISIONS
```

The central differentiator is not the AI model.

The central differentiator is:

> **Minimum input → maximum financial understanding.**

AI is the layer that makes the financial data easier to understand, search, and organize.

The first version must therefore be excellent even when the AI is completely disabled.
