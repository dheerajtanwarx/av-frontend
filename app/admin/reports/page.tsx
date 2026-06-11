"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminReport,
  downloadReportCsv,
  ApiError,
  type AdminReport,
  type ReportRange,
} from "../../lib/api";
import { TrendBarChart } from "../../components/admin/DashboardCharts";

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const num = (n: number) => new Intl.NumberFormat("en-IN").format(n);

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function statusClass(status: string): string {
  return status.toLowerCase();
}

const RANGES: { key: ReportRange; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "365", label: "1 year" },
  { key: "all", label: "All time" },
];

/* A report section wrapper with a heading and a CSV export button. */
function ReportSection({
  title,
  subtitle,
  exporting,
  onExport,
  children,
}: {
  title: string;
  subtitle: string;
  exporting: boolean;
  onExport: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-report-section">
      <div className="admin-report-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <button className="admin-btn" onClick={onExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>
      {children}
    </section>
  );
}

export default function AdminReportsPage() {
  const [range, setRange] = useState<ReportRange>("30");
  const [data, setData] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminReport(range));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleExport(report: "sales" | "orders" | "customers") {
    setExporting(report);
    setExportError("");
    try {
      await downloadReportCsv(report, range);
    } catch (e) {
      setExportError(
        e instanceof ApiError ? e.message : "Export failed. Please try again."
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <section className="admin-page admin-reports">
      <header className="admin-page-head">
        <h2>Reports</h2>
        <p>Sales, orders and customer reporting from live store data. Export any report to CSV.</p>
      </header>

      {/* range selector */}
      <div className="admin-tabs">
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={`admin-tab${range === r.key ? " active" : ""}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {exportError && <p className="admin-error">{exportError}</p>}

      {loading ? (
        <p className="admin-note">Loading reports…</p>
      ) : error ? (
        <div className="admin-dash-error">
          <p className="admin-error">{error}</p>
          <button className="admin-btn" onClick={load}>
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* ── Sales report ───────────────────────────── */}
          <ReportSection
            title="Sales Report"
            subtitle="Revenue and order volume over the selected period."
            exporting={exporting === "sales"}
            onExport={() => handleExport("sales")}
          >
            <div className="admin-stat-grid">
              <div className="admin-stat-card accent-rani">
                <div className="admin-stat-meta">
                  <span className="admin-stat-label">Net Revenue</span>
                  <span className="admin-stat-value">{inr(data.sales.totals.netRevenue)}</span>
                </div>
              </div>
              <div className="admin-stat-card accent-blue">
                <div className="admin-stat-meta">
                  <span className="admin-stat-label">Orders</span>
                  <span className="admin-stat-value">{num(data.sales.totals.orders)}</span>
                </div>
              </div>
              <div className="admin-stat-card accent-teal">
                <div className="admin-stat-meta">
                  <span className="admin-stat-label">Avg Order Value</span>
                  <span className="admin-stat-value">{inr(data.sales.totals.avgOrderValue)}</span>
                </div>
              </div>
              <div className="admin-stat-card accent-amber">
                <div className="admin-stat-meta">
                  <span className="admin-stat-label">Discounts Given</span>
                  <span className="admin-stat-value">{inr(data.sales.totals.discounts)}</span>
                </div>
              </div>
            </div>

            {data.sales.daily.length > 0 && (
              <div className="admin-chart-card" style={{ marginTop: 18 }}>
                <div className="admin-chart-head">
                  <h3>Orders per day</h3>
                </div>
                <TrendBarChart
                  data={data.sales.daily.map((d) => ({
                    date: d.date,
                    orders: d.orders,
                    revenue: d.netRevenue,
                  }))}
                />
              </div>
            )}
          </ReportSection>

          {/* ── Orders report ──────────────────────────── */}
          <ReportSection
            title="Orders Report"
            subtitle="Order status breakdown and the most recent orders in this period."
            exporting={exporting === "orders"}
            onExport={() => handleExport("orders")}
          >
            <div className="admin-report-pills">
              {data.orders.totals.byStatus.map((s) => (
                <div key={s.status} className="admin-report-pill">
                  <span className={`status-badge ${statusClass(s.status)}`}>{s.status}</span>
                  <strong>{num(s.count)}</strong>
                </div>
              ))}
            </div>

            <div className="admin-table-wrap" style={{ marginTop: 16 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="num">Items</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.recent.map((o) => (
                    <tr key={o.id}>
                      <td data-label="Order">
                        <a className="admin-cell-strong admin-link" href={`/admin/orders/${o.id}`}>
                          {o.no}
                        </a>
                      </td>
                      <td data-label="Customer">{o.customer}</td>
                      <td data-label="Date">{fmtDate(o.placedAt)}</td>
                      <td data-label="Status">
                        <span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span>
                      </td>
                      <td data-label="Items" className="num">{o.itemCount}</td>
                      <td data-label="Total" className="num">{inr(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.orders.recent.length === 0 && (
                <p className="admin-note">No orders in this period.</p>
              )}
            </div>
          </ReportSection>

          {/* ── Customers report ───────────────────────── */}
          <ReportSection
            title="Customers Report"
            subtitle="Top customers by spend, plus new sign-ups in this period. CSV exports the full customer book."
            exporting={exporting === "customers"}
            onExport={() => handleExport("customers")}
          >
            <div className="admin-stat-grid">
              <div className="admin-stat-card accent-violet">
                <div className="admin-stat-meta">
                  <span className="admin-stat-label">Total Customers</span>
                  <span className="admin-stat-value">{num(data.customers.totals.total)}</span>
                </div>
              </div>
              <div className="admin-stat-card accent-green">
                <div className="admin-stat-meta">
                  <span className="admin-stat-label">New This Period</span>
                  <span className="admin-stat-value">{num(data.customers.totals.newInRange)}</span>
                </div>
              </div>
            </div>

            <div className="admin-table-wrap" style={{ marginTop: 16 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th className="num">Orders</th>
                    <th className="num">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.top.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Customer">
                        <a className="admin-cell-strong admin-link" href={`/admin/customers/${c.id}`}>
                          {c.name || "Unnamed customer"}
                        </a>
                        {c.email && <div className="admin-cell-sub">{c.email}</div>}
                      </td>
                      <td data-label="Phone">{c.phone || "—"}</td>
                      <td data-label="Orders" className="num">{c.orders}</td>
                      <td data-label="Spend" className="num">{inr(c.spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.customers.top.length === 0 && (
                <p className="admin-note">No customer spend in this period.</p>
              )}
            </div>
          </ReportSection>
        </>
      ) : null}
    </section>
  );
}
