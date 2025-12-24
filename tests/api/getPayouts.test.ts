

import { describe, expect, it, vi } from "vitest";

import { getPayoutsHandler } from "../../src/api/getPayouts";

// Minimal Express-like response mock
function createResMock() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res as { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("getPayoutsHandler", () => {
  it("returns payouts and matches snapshot", () => {
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
        {
          id: "po_2",
          creatorId: "cr_2",
          amountMinor: 9900,
          currency: "GBP",
          scheduledFor: "2025-12-25T00:00:00.000Z",
          status: "HELD",
          riskScore: 0.9,
          method: "PAYPAL",
        },
      ],
    };

    const handler = getPayoutsHandler({ data });

    const res = createResMock();
    handler({} as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchSnapshot();
  });
});