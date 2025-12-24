import React, { useEffect, useMemo, useState } from "react";

import type { Payout, PayoutDetailsResponse } from "../../src/types";

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

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function Drawer(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 1000,
      }}
      onClick={props.onClose}
    >
      <div
        style={{
          height: "100%",
          width: "min(520px, 92vw)",
          background: "white",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
          padding: 16,
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{props.title}</h2>
          <button
            type="button"
            onClick={props.onClose}
            style={{
              padding: "6px 10px",
              border: "1px solid #ddd",
              borderRadius: 6,
              background: "white",
              cursor: "pointer",
              height: 34,
              alignSelf: "center",
            }}
          >
            Close
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{props.children}</div>
      </div>
    </div>
  );
}

function PayoutDetailsView(props: { state: ApiState<PayoutDetailsResponse> }) {
  const { state } = props;

  if (state.status === "idle" || state.status === "loading") return <p>Loading…</p>;
  if (state.status === "error") {
    return <p style={{ color: "crimson" }}>Failed to load payout details: {state.error}</p>;
  }

  const details = state.data!;
  const fraudNotes = details.fraudSignals
    .filter((s) => (s.note ?? "").trim().length > 0)
    .slice(0, 20);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ padding: "4px 8px", border: "1px solid #eee", borderRadius: 999 }}>
          <strong>Status:</strong> {details.payout.status}
        </span>
        <span style={{ padding: "4px 8px", border: "1px solid #eee", borderRadius: 999 }}>
          <strong>Amount:</strong> {formatMoney(details.payout.amountMinor, details.payout.currency)}
        </span>
        <span style={{ padding: "4px 8px", border: "1px solid #eee", borderRadius: 999 }}>
          <strong>Risk:</strong> {details.payout.riskScore}
        </span>
      </div>

      <h3 style={{ margin: "14px 0 8px" }}>Related invoices</h3>
      {details.invoices.length === 0 ? (
        <p>No invoices linked.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #eee" }}>
                Invoice ID
              </th>
              <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #eee" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {details.invoices.map((inv) => (
              <tr key={inv.invoiceId}>
                <td style={{ padding: "8px", borderBottom: "1px solid #f1f1f1" }}>{inv.invoiceId}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #f1f1f1" }}>{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ margin: "14px 0 8px" }}>Latest payment attempt</h3>
      {!details.latestPaymentAttempt ? (
        <p>No payment attempts found.</p>
      ) : (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
          <div>
            <strong>ID:</strong> {details.latestPaymentAttempt.id}
          </div>
          <div>
            <strong>Status:</strong> {details.latestPaymentAttempt.status}
          </div>
          <div>
            <strong>Created:</strong> {formatDateTime(details.latestPaymentAttempt.createdAt)}
          </div>
          {details.latestPaymentAttempt.failureCode && (
            <div>
              <strong>Failure:</strong> {details.latestPaymentAttempt.failureCode}
            </div>
          )}
        </div>
      )}

      <h3 style={{ margin: "14px 0 8px" }}>Fraud notes</h3>
      {fraudNotes.length === 0 ? (
        <p>No fraud notes.</p>
      ) : (
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {fraudNotes.map((s) => (
            <li key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {s.severity} • {s.type} • {formatDateTime(s.createdAt)}
              </div>
              <div>{s.note}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const App: React.FC = () => {
  const [payoutsState, setPayoutsState] = useState<ApiState<Payout[]>>({
    status: "idle",
    data: null,
    error: null,
  });

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [detailsState, setDetailsState] = useState<ApiState<PayoutDetailsResponse>>({
    status: "idle",
    data: null,
    error: null,
  });

  // Fetch payouts list
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setPayoutsState({ status: "loading", data: null, error: null });
        const res = await fetch("/api/payouts", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const json = (await res.json()) as { payouts: Payout[] };
        if (!Array.isArray(json.payouts)) {
          throw new Error("Unexpected API response: expected { payouts: Payout[] }");
        }

        setPayoutsState({ status: "success", data: json.payouts, error: null });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setPayoutsState({ status: "error", data: null, error: message });
      }
    })();

    return () => controller.abort();
  }, []);

  // Fetch details when a payout is selected
  useEffect(() => {
    if (!selectedPayoutId) {
      setDetailsState({ status: "idle", data: null, error: null });
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setDetailsState({ status: "loading", data: null, error: null });

        // Calls backend: GET /api/payouts/:payoutId
        const res = await fetch(`/api/payouts/${encodeURIComponent(selectedPayoutId)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const json = (await res.json()) as PayoutDetailsResponse;
        if (!json || typeof json !== "object" || !(json as any).payout) {
          throw new Error("Unexpected API response: expected payout details object");
        }

        setDetailsState({ status: "success", data: json, error: null });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unknown error";
        setDetailsState({ status: "error", data: null, error: message });
      }
    })();

    return () => controller.abort();
  }, [selectedPayoutId]);

  const rows = useMemo(() => {
    if (payoutsState.status !== "success") return [];
    return payoutsState.data;
  }, [payoutsState]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Payouts</h1>

      {payoutsState.status === "loading" && <p>Loading…</p>}
      {payoutsState.status === "error" && (
        <p style={{ color: "crimson" }}>Failed to load payouts: {payoutsState.error}</p>
      )}

      {payoutsState.status === "success" && (
        <>
          {rows.length === 0 ? (
            <p>No payouts found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1040,
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
                      "Actions",
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
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{p.id}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{p.creatorId}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                        {formatMoney(p.amountMinor, p.currency)}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{p.currency}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{formatDate(p.scheduledFor)}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{p.status}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{p.riskScore}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{p.method}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedPayoutId(p.id)}
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            background: "white",
                            cursor: "pointer",
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedPayoutId && (
        <Drawer
          title={`Inspect payout ${selectedPayoutId}`}
          onClose={() => setSelectedPayoutId(null)}
        >
          <PayoutDetailsView state={detailsState} />
        </Drawer>
      )}
    </div>
  );
};
