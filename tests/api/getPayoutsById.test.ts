

import { describe, expect, it, vi } from "vitest";

import { getPayoutByIdHandler } from "../../src/api/getPayoutById";

// Minimal Express-like response mock
function createResMock() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res as { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

function createReqMock(params: Record<string, string>) {
  return { params } as any;
}

describe("getPayoutByIdHandler", () => {
  it("returns payout details (invoices, latest attempt, fraud notes) and matches snapshot", () => {
    const data = {
      payouts: [
        {
          id: "po_1",
          creatorId: "cr_1",
          amountMinor: 12345,
          currency: "GBP",
          scheduledFor: "2025-12-24T00:00:00.000Z",
          status: "PENDING",
          riskScore: 0.42,
          method: "BANK_TRANSFER",
        },
      ],
      payoutInvoices: [
        { payoutId: "po_1", invoiceId: "inv_1", status: "OPEN" },
        { payoutId: "po_1", invoiceId: "inv_2", status: "PAID" },
        { payoutId: "po_other", invoiceId: "inv_x", status: "OPEN" },
      ],
      payments: [
        { id: "pay_1", payoutId: "po_1" },
        { id: "pay_2", payoutId: "po_1" },
        { id: "pay_other", payoutId: "po_other" },
      ],
      paymentAttempts: [
        {
          id: "pa_old",
          paymentId: "pay_1",
          status: "FAILED",
          failureCode: "INSUFFICIENT_FUNDS",
          createdAt: "2025-12-23T10:00:00.000Z",
        },
        {
          id: "pa_newest",
          paymentId: "pay_2",
          status: "SUCCEEDED",
          createdAt: "2025-12-24T09:30:00.000Z",
        },
        {
          id: "pa_other",
          paymentId: "pay_other",
          status: "SUCCEEDED",
          createdAt: "2025-12-24T09:40:00.000Z",
        },
      ],
      fraudSignals: [
        // Direct payout signal
        {
          id: "fs_payout",
          entityType: "PAYOUT",
          entityId: "po_1",
          type: "MANUAL_REVIEW",
          severity: "MEDIUM",
          note: "Flagged by ops",
          createdAt: "2025-12-24T09:00:00.000Z",
        },
        // Creator-level signal
        {
          id: "fs_creator",
          entityType: "CREATOR",
          entityId: "cr_1",
          type: "CHARGEBACK_RISK",
          severity: "HIGH",
          note: "High dispute rate",
          createdAt: "2025-12-24T09:10:00.000Z",
        },
        // Payment-level signal (linked via paymentIds)
        {
          id: "fs_payment",
          entityType: "PAYMENT",
          entityId: "pay_2",
          type: "VELOCITY",
          severity: "LOW",
          note: "Unusual payout velocity",
          createdAt: "2025-12-24T09:20:00.000Z",
        },
        // Unrelated signal
        {
          id: "fs_other",
          entityType: "PAYOUT",
          entityId: "po_other",
          type: "OTHER",
          severity: "LOW",
          note: "Ignore",
          createdAt: "2025-12-24T09:50:00.000Z",
        },
      ],
    };

    const jsonError = vi.fn((res: any, status: number, code: string, message: string, details?: any) => {
      return res.status(status).json({
        error: {
          code,
          message,
          ...(details ? { details } : {}),
        },
      });
    });

    const handler = getPayoutByIdHandler({ data, jsonError });

    const req = createReqMock({ payoutId: "po_1" });
    const res = createResMock();

    handler(req, res as any);

    expect(jsonError).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchSnapshot();
  });

  it("returns 404 error envelope and matches snapshot when payout is missing", () => {
    const data = {
      payouts: [],
      payoutInvoices: [],
      payments: [],
      paymentAttempts: [],
      fraudSignals: [],
    };

    const jsonError = vi.fn((res: any, status: number, code: string, message: string, details?: any) => {
      return res.status(status).json({
        error: {
          code,
          message,
          ...(details ? { details } : {}),
        },
      });
    });

    const handler = getPayoutByIdHandler({ data, jsonError });

    const req = createReqMock({ payoutId: "po_missing" });
    const res = createResMock();

    handler(req, res as any);

    expect(jsonError).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledTimes(1);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchSnapshot();
  });
});