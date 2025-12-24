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
