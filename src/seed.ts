// lib/seed.ts
import type {
  Creator,
  FraudSignal,
  Payment,
  PaymentAttempt,
  Payout,
  PayoutDecision,
  PayoutInvoice
} from "./types";

export interface SeedData {
  creators: Creator[];
  payouts: Payout[];
  payoutInvoices: PayoutInvoice[];
  payments: Payment[];
  paymentAttempts: PaymentAttempt[];
  fraudSignals: FraudSignal[];
  payoutDecisions: PayoutDecision[];
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function nowIso() {
  return new Date().toISOString();
}

function daysFromToday(delta: number) {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return d;
}

function minor(amount: number) {
  // e.g. 12.34 -> 1234
  return Math.round(amount * 100);
}

export function createSeedData(): SeedData {
  const today = isoDate(new Date());
  const tomorrow = isoDate(daysFromToday(1));
  const yesterday = isoDate(daysFromToday(-1));

  const creators: Creator[] = [
    { id: "cr_001" },
    { id: "cr_002" },
    { id: "cr_003" },
    { id: "cr_004" }
  ];

  const payouts: Payout[] = [
    {
      id: "po_001",
      creatorId: "cr_001",
      amountMinor: minor(245.5),
      currency: "USD",
      scheduledFor: today,
      status: "PENDING",
      riskScore: 18,
      method: 'BANK_TRANSFER'
    },
    {
      id: "po_002",
      creatorId: "cr_002",
      amountMinor: minor(980.0),
      currency: "EUR",
      scheduledFor: today,
      status: "FLAGGED",
      riskScore: 82,
      method: 'BANK_TRANSFER'
    },
    {
      id: "po_003",
      creatorId: "cr_003",
      amountMinor: minor(120.25),
      currency: "GBP",
      scheduledFor: tomorrow,
      status: "PENDING",
      riskScore: 35,
      method: 'BANK_TRANSFER'
    },
    {
      id: "po_004",
      creatorId: "cr_004",
      amountMinor: minor(55.0),
      currency: "USD",
      scheduledFor: yesterday,
      status: "PAID",
      riskScore: 12,
      method: 'BANK_TRANSFER'
    },
    {
      id: "po_005",
      creatorId: "cr_001",
      amountMinor: minor(410.75),
      currency: "EUR",
      scheduledFor: today,
      status: "HELD",
      riskScore: 67,
      method: 'BANK_TRANSFER'
    }
  ];

  const payoutInvoices: PayoutInvoice[] = [
    { payoutId: "po_001", invoiceId: "inv_1001", status: "OPEN" },
    { payoutId: "po_001", invoiceId: "inv_1002", status: "SETTLED" },

    { payoutId: "po_002", invoiceId: "inv_2002", status: "OPEN" },

    { payoutId: "po_003", invoiceId: "inv_3001", status: "OPEN" },

    { payoutId: "po_004", invoiceId: "inv_4001", status: "SETTLED" },
    { payoutId: "po_004", invoiceId: "inv_4002", status: "SETTLED" },

    { payoutId: "po_005", invoiceId: "inv_5001", status: "OPEN" }
  ];

  const payments: Payment[] = [
    { id: "pay_001", payoutId: "po_001", status: "CREATED" },
    { id: "pay_002", payoutId: "po_002", status: "FAILED" },
    { id: "pay_003", payoutId: "po_004", status: "SETTLED" },
    { id: "pay_004", payoutId: "po_005", status: "CREATED" }
  ];

  // Keep attempts coherent: latest attempt is highest createdAt
  const paymentAttempts: PaymentAttempt[] = [
    // po_001 -> created (no attempt yet) OR one pending-like success? We'll put a failure then retry pending.
    {
      id: "pa_001",
      paymentId: "pay_001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: "FAILURE",
      failureCode: "BANK_ACCOUNT_UNVERIFIED"
    },
    {
      id: "pa_002",
      paymentId: "pay_001",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: "SUCCESS"
    },

    // po_002 -> failed attempts
    {
      id: "pa_003",
      paymentId: "pay_002",
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      status: "FAILURE",
      failureCode: "INSUFFICIENT_FUNDS"
    },
    {
      id: "pa_004",
      paymentId: "pay_002",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      status: "FAILURE",
      failureCode: "RISK_BLOCKED"
    },

    // po_004 -> settled payment, one successful attempt
    {
      id: "pa_005",
      paymentId: "pay_003",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: "SUCCESS"
    },

    // po_005 -> held, one failure
    {
      id: "pa_006",
      paymentId: "pay_004",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "FAILURE",
      failureCode: "BENEFICIARY_NAME_MISMATCH"
    }
  ];

  const fraudSignals: FraudSignal[] = [
    {
      id: "fs_001",
      entityType: "PAYOUT",
      entityId: "po_002",
      type: "VELOCITY",
      severity: "HIGH",
      createdAt: nowIso(),
      note: "Unusual payout frequency compared to 30d baseline."
    },
    {
      id: "fs_002",
      entityType: "CREATOR",
      entityId: "cr_002",
      type: "CHARGEBACK_SPIKE",
      severity: "HIGH",
      createdAt: nowIso(),
      note: "Chargebacks spiked 3x in the last 48h."
    },
    {
      id: "fs_003",
      entityType: "PAYMENT",
      entityId: "pay_004",
      type: "IP_MISMATCH",
      severity: "MEDIUM",
      createdAt: nowIso(),
      note: "IP country differs from payout bank country."
    },
    {
      id: "fs_004",
      entityType: "PAYOUT",
      entityId: "po_005",
      type: "VELOCITY",
      severity: "MEDIUM",
      createdAt: nowIso(),
      note: "Multiple payout method changes observed."
    }
  ];

  const payoutDecisions: PayoutDecision[] = [
    {
      id: "pd_001",
      payoutId: "po_005",
      action: "HOLD",
      reason: "Pending manual review due to medium risk signals.",
      decidedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    }
  ];

  return {
    creators,
    payouts,
    payoutInvoices,
    payments,
    paymentAttempts,
    fraudSignals,
    payoutDecisions
  };
}

/**
 * Convenience: compute daily totals for the Funds Snapshot header.
 * - scheduledToday: sum of payouts scheduled for today (any status)
 * - held: sum where status=HELD
 * - flagged: sum where status=FLAGGED
 *
 * If you want "scheduled today" to exclude PAID/REJECTED, filter here.
 */
export function computeSnapshot(data: SeedData, dateISO = isoDate(new Date())) {
  const scheduledToday = data.payouts
    .filter((p) => p.scheduledFor === dateISO)
    .reduce((acc, p) => acc + p.amountMinor, 0);

  const held = data.payouts
    .filter((p) => p.scheduledFor === dateISO && p.status === "HELD")
    .reduce((acc, p) => acc + p.amountMinor, 0);

  const flagged = data.payouts
    .filter((p) => p.scheduledFor === dateISO && p.status === "FLAGGED")
    .reduce((acc, p) => acc + p.amountMinor, 0);

  return { dateISO, scheduledToday, held, flagged };
}

/**
 * Convenience: get detail bundle for a payout id (for your /api/payouts/:id route).
 */
export function buildPayoutDetail(data: SeedData, payoutId: string) {
  const payout = data.payouts.find((p) => p.id === payoutId);
  if (!payout) return null;

  const creator = data.creators.find((c) => c.id === payout.creatorId) ?? null;

  const invoices = data.payoutInvoices.filter((pi) => pi.payoutId === payoutId);

  const payment = data.payments.find((pay) => pay.payoutId === payoutId) ?? null;

  const attempts = payment
    ? data.paymentAttempts
        .filter((a) => a.paymentId === payment.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    : [];

  const latestAttempt = attempts[0] ?? null;

  const fraudNotes = data.fraudSignals
    .filter((fs) => (fs.entityType === "PAYOUT" && fs.entityId === payoutId) ||
                    (creator && fs.entityType === "CREATOR" && fs.entityId === creator.id) ||
                    (payment && fs.entityType === "PAYMENT" && fs.entityId === payment.id))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const decisions = data.payoutDecisions
    .filter((d) => d.payoutId === payoutId)
    .sort((a, b) => (a.decidedAt < b.decidedAt ? 1 : -1));

  return { payout, creator, invoices, payment, latestAttempt, fraudNotes, decisions };
}