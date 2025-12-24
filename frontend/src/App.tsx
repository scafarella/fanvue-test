
import React, { useEffect, useMemo, useState } from "react";

import type { Payout } from "../../src/types";

type ApiState<T> =
  | { status: "idle" | "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

function formatMoney(amountMinor: number, currency: Payout["currency"]): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export const App: React.FC = () => {
  const [state, setState] = useState<ApiState<Payout[]>>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setState({ status: "loading", data: null, error: null });
        const res = await fetch("/api/payouts", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const json = (await res.json()) as {payouts: Payout[]};
        if (!Array.isArray(json.payouts)) {
          throw new Error("Unexpected API response: expected an array");
        }

        // Trust the API shape for now (this is a 2-hour sprint). If you want stricter
        // safety later, add a zod/io-ts runtime validator here.
        setState({ status: "success", data: json.payouts, error: null });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ status: "error", data: null, error: message });
      }
    })();

    return () => controller.abort();
  }, []);

  const rows = useMemo(() => {
    if (state.status !== "success") return [];
    return state.data;
  }, [state]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Payouts</h1>

      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && (
        <p style={{ color: "crimson" }}>
          Failed to load payouts: {state.error}
        </p>
      )}

      {state.status === "success" && (
        <>
          {rows.length === 0 ? (
            <p>No payouts found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "ID",
                      "Creator",
                      "Amount",
                      "Currency",
                      "Scheduled For",
                      "Status",
                      "Risk Score",
                      "Method",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 8px",
                          borderBottom: "1px solid #ddd",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {p.id}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {p.creatorId}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {formatMoney(p.amountMinor, p.currency)}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {p.currency}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {formatDate(p.scheduledFor)}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {p.status}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {p.riskScore}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {p.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
