import type { Request, Response } from 'express';
import express from 'express';
import { createSeedData } from './seed';

const data = createSeedData()

export const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
};

export const createApp = () => {
  const app = express();

  app.get('/health', healthHandler);

  app.get('/api/payouts', (_req: Request, res: Response) => {
    res.status(200).json({ 
      payouts: data.payouts
    });
  });

  app.get('/api/payouts/:payoutId', (req: Request, res: Response) => {
    const payoutId = req.params.payoutId;

    const payout = data.payouts.find((p) => p.id === payoutId);
    if (!payout) {
      return res.status(404).json({ error: `Payout not found: ${payoutId}` });
    }

    const payoutInvoices = (data as any).payoutInvoices ?? (data as any).invoices ?? [];
    const payments = (data as any).payments ?? [];
    const paymentAttempts = (data as any).paymentAttempts ?? [];
    const fraudSignals = (data as any).fraudSignals ?? [];

    const invoices = (payoutInvoices as any[])
      .filter((pi) => pi.payoutId === payoutId)
      .map((pi) => ({ invoiceId: pi.invoiceId, status: pi.status }));

    const relatedPayments = (payments as any[]).filter((pay) => pay.payoutId === payoutId);
    const paymentIds = relatedPayments.map((p) => p.id);

    const attemptsForPayout = (paymentAttempts as any[])
      .filter((a) => paymentIds.includes(a.paymentId))
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return tb - ta;
      });

    const latestPaymentAttempt = attemptsForPayout.length > 0 ? attemptsForPayout[0] : null;

    // Include signals related to this payout, its creator, or any associated payment.
    const relatedFraudSignals = (fraudSignals as any[])
      .filter((s) => {
        if (s.entityType === 'PAYOUT' && s.entityId === payoutId) return true;
        if (s.entityType === 'CREATOR' && s.entityId === payout.creatorId) return true;
        if (s.entityType === 'PAYMENT' && paymentIds.includes(s.entityId)) return true;
        return false;
      })
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return tb - ta;
      });

    return res.status(200).json({
      payout,
      invoices,
      latestPaymentAttempt,
      fraudSignals: relatedFraudSignals,
    });
  });

  return app;
};

export const startServer = (port = Number(process.env.PORT) || 3000) => {
  const app = createApp();

  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
};

startServer();
