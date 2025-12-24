# Senior Fullstack Engineer Challenge – Payments, Payouts & Fraud (2-Hour Sprint)

## 🔍 Scenario

You’re joining the Fanvue payments platform team. The team is building a unified “Funds Console” to let operations specialists review creator payouts, track payment settlements, and investigate fraud signals in real time. You’ll ship a constrained vertical slice that proves you can reason across the UI, API, and data model within a tight two-hour window.

---

## 🎯 Core Objectives

1. **End-to-End Feature Delivery**  
   Build a small but cohesive product workflow that spans the UI, API, and persistence layers.

2. **Domain Understanding**  
   Show that you can reason about payment & payout lifecycles, fraud review processes, and the data relationships that underpin them.

3. **Engineering Excellence**  
   Demonstrate code structure, testing philosophy, and documentation habits that scale for a senior engineer.

4. **LLM Usage Disclosure**
    - Use of **LLMs (e.g., ChatGPT, GitHub Copilot, Claude)** is **allowed and encouraged**, but **all prompts used must be included** as an appendix in your submission.
    - Clearly indicate which parts of the code were written with AI assistance.

---

## 🛠️ Requirements

### 1. Frontend (Next.js + React preferred)

- **Funds Snapshot View**
    - Single-page layout with a lightweight header showing: total scheduled today, held amount, and flagged amount.
    - A filter pill group for “All”, “Pending”, “Flagged”, “Paid”. Persist the last-selected filter in `localStorage`.
    - A table listing payouts with columns: creator, amount & currency, method, scheduled date, status, and risk score.
- **Inline Detail Panel**
    - Selecting a payout reveals an inline drawer or modal with related invoices (at least IDs & statuses), latest payment attempt, and fraud notes.
    - Provide “Approve”, “Hold”, and “Reject” buttons; require a free-text reason for “Reject”. Surface success/error feedback inline.
- **State & UX**
    - Use React Query (or equivalent) for fetching and mutations with loading/empty/error states.

### 2. Backend API (Node.js/TypeScript)

- **Behavior**
    - Seed data in memory or JSON.
    - Return consistent JSON error envelopes. Log each decision (console log acceptable) with payload and outcome.
    - Describe (in README) how you’d secure/authenticate the routes and add audit trails in production.

### 3. Database & Data Modeling

- **Schema Sketch (pseudo-DDL or TypeScript interfaces)**
    - Cover `creators`, `payouts`, `payout_invoices`, `payments`, `payment_attempts`, `fraud_signals`, and `payout_decisions`.
    - Explain key relationships, indexing you’d add (e.g., `payouts(status, scheduled_for)`), and how you’d capture history/audit data.
    - Justify why fraud signals live outside `payments` (e.g., shared across payouts, retention policies).
- **Data Layer Notes**
    - You may remain in-memory, but call out how you’d evolve to an actual DB and ORM and handle schema migrations.

---

## ✅ Deliverables

1. **Source Code** in a single repo (frontend + API; can be monorepo or single app).
2. **Testing**
    - At least one unit test for the decision rules.
    - Optional: a component/integration test for the approve/reject UI (describe how you’d extend coverage if time allowed).
3. **Architecture Notes**
    - Summarize data modeling decisions and fraud table separation.
    - Mention scaling considerations you’d tackle next (idempotency, batching, async fraud review).
4. **README**
    - Known shortcuts/limitations + security considerations.
    - AI usage disclosure (list prompts/tools used).
    - Do not use AI to write the whole readme file because it will become too verbose and we want to know what your actual thought process has been.

---

## ⏰ Time Guidance

Expect ~2 focused hours. Be intentional about scope cuts — ship the essentials, annotate shortcuts in your README, and highlight what you’d do with more time.

---

## 💡 Tips

- Demonstrate how you’d evolve the system (multi-tenant payouts, ledger integration, async fraud scoring).
- Highlight observability hooks (structured logs, where you’d place metrics/tracing).
- If you stub external providers (Stripe, Trulioo), show how you’d encapsulate them for future substitution.
- It's important to know that you won’t have time to complete every requirement.
- Deliver an end to end solution and document why you chose to (de)prioritize requirements.
- Favor pragmatic solutions that reflect experience running payment systems in production.

Good luck — we’re excited to see how you approach complex funds workflows end to end!