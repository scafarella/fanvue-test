import type { Request, Response } from "express";

export function getPayoutsHandler({ data }: { data: any }) {
  return (_req: Request, res: Response) => {
    return res.status(200).json({ payouts: data.payouts });
  };
}