import type { Request, Response } from "express";

type JsonErrorFn = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) => Response;

export function postPayoutDecisionHandler({
  data,
  jsonError,
}: {
  data: any;
  jsonError: JsonErrorFn;
}) {
  return (req: Request, res: Response) => {
    const payoutId = req.params.payoutId;

    const payout = data.payouts.find((p: any) => p.id === payoutId);
    if (!payout) {
      return jsonError(res, 404, "NOT_FOUND", `Payout not found: ${payoutId}`, { payoutId });
    }

    const body = (req.body ?? {}) as Partial<{
      action: "APPROVE" | "HOLD" | "REJECT";
      reason?: string;
    }>;

    const action = body.action;
    const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

    if (action !== "APPROVE" && action !== "HOLD" && action !== "REJECT") {
      return jsonError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid action. Expected APPROVE | HOLD | REJECT.",
        { received: body.action }
      );
    }

    if (action === "REJECT" && (!reason || reason.length === 0)) {
      return jsonError(res, 400, "VALIDATION_ERROR", "Reject requires a free-text reason.", {
        payoutId,
      });
    }

    const payoutDecisions = (data.payoutDecisions ??= []);

    const decision = {
      id: `pd_${Math.random().toString(36).slice(2, 10)}`,
      payoutId,
      action,
      ...(reason ? { reason } : {}),
      decidedAt: new Date().toISOString(),
    };

    // eslint-disable-next-line no-console
    console.log("[payout-decision]", {
      payoutId,
      action,
      reason,
      decisionId: decision.id,
      decidedAt: decision.decidedAt,
    });

    payoutDecisions.push(decision);

    return res.status(200).json({ ok: true, decision });
  };
}