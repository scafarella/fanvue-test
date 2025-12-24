// lib/types.ts
export type PayoutStatus = "PENDING" | "FLAGGED" | "HELD" | "PAID" | "REJECTED";

export interface Creator {
  id: string;
}

export interface Payout {
  id: string;
  creatorId: string;
  amountMinor: number; // e.g. cents
  currency: "USD" | "EUR" | "GBP";
  scheduledFor: string; // ISO date
  status: PayoutStatus;
  riskScore: number; // 0..100
  method: "BANK_TRANSFER";
}

export interface PayoutInvoice {
  payoutId: string;
  invoiceId: string;
  status: "OPEN" | "SETTLED";
}

export interface Payment {
  id: string;
  payoutId: string;
  status: "CREATED" | "SETTLED" | "FAILED";
}

export interface PaymentAttempt {
  id: string;
  paymentId: string;
  createdAt: string;
  status: "SUCCESS" | "FAILURE";
  failureCode?: string;
}

export interface FraudSignal {
  id: string;
  entityType: "PAYOUT" | "CREATOR" | "PAYMENT";
  entityId: string;
  type: "CHARGEBACK_SPIKE" | "VELOCITY" | "IP_MISMATCH";
  severity: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  note?: string;
}

export interface PayoutDecision {
  id: string;
  payoutId: string;
  action: "APPROVE" | "HOLD" | "REJECT";
  reason?: string;
  decidedAt: string;
}

export interface PayoutDetailsResponse {
  payout: Payout;
  invoices: Array<Pick<PayoutInvoice, "invoiceId" | "status">>;
  latestPaymentAttempt: PaymentAttempt | null;
  fraudSignals: FraudSignal[];
}