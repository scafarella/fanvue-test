import type { Request, Response } from 'express';
import express from 'express';
import { createSeedData } from './seed';

import { jsonError } from './api/jsonError';
import { getPayoutsHandler } from './api/getPayouts';
import { getPayoutByIdHandler } from './api/getPayoutById';
import { postPayoutDecisionHandler } from './api/postPayoutDecision';

const data = createSeedData();

export const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
};

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/health', healthHandler);

  app.get('/api/payouts', getPayoutsHandler({ data }));
  app.get('/api/payouts/:payoutId', getPayoutByIdHandler({ data, jsonError }));
  app.post(
    '/api/payouts/:payoutId/decision',
    postPayoutDecisionHandler({ data, jsonError })
  );

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
