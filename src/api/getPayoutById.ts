import type { Request, Response } from "express";

type JsonErrorFn = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) => Response;

export function getPayoutByIdHandler({ data, jsonError }: { data: any; jsonError: JsonErrorFn }) {
  return (req: Request, res: Response) => {
    const payoutId = req.params.payoutId;

    const payout = data.payouts.find((p: any) => p.id === payoutId);
    if (!payout) {
      return jsonError(res, 404, "NOT_FOUND", `Payout not found: ${payoutId}`, { payoutId });
    }

    const payoutInvoices = data.payoutInvoices ?? data.invoices ?? [];
    const payments = data.payments ?? [];
    const paymentAttempts = data.paymentAttempts ?? [];
    const fraudSignals = data.fraudSignals ?? [];

    const invoices = payoutInvoices
      .filter((pi: any) => pi.payoutId === payoutId)
      .map((pi: any) => ({ invoiceId: pi.invoiceId, status: pi.status }));

    const relatedPayments = payments.filter((pay: any) => pay.payoutId === payoutId);
    const paymentIds = relatedPayments.map((p: any) => p.id);

    const attemptsForPayout = paymentAttempts
      .filter((a: any) => paymentIds.includes(a.paymentId))
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestPaymentAttempt = attemptsForPayout.length > 0 ? attemptsForPayout[0] : null;

    const relatedFraudSignals = fraudSignals
      .filter((s: any) => {
        if (s.entityType === "PAYOUT" && s.entityId === payoutId) return true;
        if (s.entityType === "CREATOR" && s.entityId === payout.creatorId) return true;
        if (s.entityType === "PAYMENT" && paymentIds.includes(s.entityId)) return true;
        return false;
      })
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      payout,
      invoices,
      latestPaymentAttempt,
      fraudSignals: relatedFraudSignals,
    });
  };
}