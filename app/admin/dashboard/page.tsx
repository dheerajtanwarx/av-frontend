"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { IndianRupee, Clock, Check, Calendar, CircleX, Undo2 } from "lucide-react";
import {
  fetchAdminDashboard,
  ApiError,
  type AdminDashboard,
} from "../../lib/api";
import { useAdminRealtime } from "../../lib/admin-realtime";
import {
  TrendLineChart,
  TrendBarChart,
  StatusBreakdown,
} from "../../components/admin/DashboardCharts";
import { StatCard } from "../../components/admin/StatCard";
import {
  OrdersIcon,
  CustomersIcon,
  ProductsIcon,
} from "../../components/admin/icons";

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact INR for chart axis labels (₹1.2L, ₹80k). */
function inrCompact(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(1)}Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(1)}L`;
  if (amount >= 1e3) return `₹${Math.round(amount / 1e3)}k`;
  return `₹${Math.round(amount)}`;
}

const num = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const RupeeIcon = ({ className }: { className?: string }) => (
  <IndianRupee className={className} strokeWidth={2} />
);
const ClockIcon = ({ className }: { className?: string }) => (
  <Clock className={className} strokeWidth={2} />
);
const CheckIcon = ({ className }: { className?: string }) => (
  <Check className={className} strokeWidth={2} />
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <Calendar className={className} strokeWidth={2} />
);
const CancelIcon = ({ className }: { className?: string }) => (
  <CircleX className={className} strokeWidth={2} />
);
const RefundIcon = ({ className }: { className?: string }) => (
  <Undo2 className={className} strokeWidth={2} />
);

type Card = {
  key: string;
  label: string;
  value: number;
  format: (n: number) => string;
  icon: (p: { className?: string }) => React.ReactElement;
  accent: string;
  series?: number[];
  /** Listing page this card drills into, reusing existing routes + filters. */
  href?: string;
};

function StatCards({ d }: { d: AdminDashboard }) {
  const s = d.stats;
  const revSeries = d.daily.map((p) => p.revenue);
  const orderSeries = d.daily.map((p) => p.orders);
  const cards: Card[] = [
    { key: "revenue", label: "Revenue", value: s.totalRevenue, format: inr, icon: RupeeIcon, accent: "rani", series: revSeries, href: "/admin/reports" },
    { key: "orders", label: "Total Orders", value: s.totalOrders, format: num, icon: OrdersIcon, accent: "blue", series: orderSeries, href: "/admin/orders" },
    { key: "today", label: "Today’s Orders", value: s.todayOrders, format: num, icon: CalendarIcon, accent: "teal", href: "/admin/orders?status=today" },
    { key: "pending", label: "Pending Orders", value: s.pendingOrders, format: num, icon: ClockIcon, accent: "amber", href: "/admin/orders?status=pending" },
    { key: "completed", label: "Completed Orders", value: s.deliveredOrders, format: num, icon: CheckIcon, accent: "green", href: "/admin/orders?status=DELIVERED" },
    { key: "cancelled", label: "Cancelled Orders", value: s.cancelledOrders, format: num, icon: CancelIcon, accent: "red", href: "/admin/orders?status=CANCELLED" },
    { key: "refunds", label: "Refunds", value: s.refunds, format: num, icon: RefundIcon, accent: "violet", href: "/admin/orders?status=refunded" },
    { key: "customers", label: "Total Customers", value: s.totalCustomers, format: num, icon: CustomersIcon, accent: "teal", href: "/admin/customers" },
    { key: "products", label: "Total Products", value: s.totalProducts, format: num, icon: ProductsIcon, accent: "violet", href: "/admin/products" },
  ];

  return (
    <div className="admin-stat-grid">
      {cards.map((c, i) => (
        <StatCard
          key={c.key}
          index={i}
          label={c.label}
          value={c.value}
          format={c.format}
          accent={c.accent}
          icon={c.icon}
          series={c.series}
          href={c.href}
        />
      ))}
    </div>
  );
}

/* Admin dashboard — headline stats + trend/status charts from real DB data.
   AdminGuard (layout) has already confirmed an ADMIN session. */
export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      setData(await fetchAdminDashboard());
    } catch (e) {
      // A failed silent refresh keeps the current numbers on screen.
      if (!silent) {
        setError(e instanceof ApiError ? e.message : "Failed to load dashboard.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live metrics: order/stock events broadcast a dashboard:update nudge —
  // silently refetch so cancellation (and all other) numbers move instantly.
  useAdminRealtime({ onDashboard: () => load(true) });

  return (
    <section className="admin-page admin-dashboard">
      <header className="admin-page-head">
        <h2>Dashboard</h2>
        <p>An at-a-glance overview of revenue, orders and store activity.</p>
      </header>

      {loading ? (
        <div className="admin-dash-loading">
          <div className="admin-stat-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-stat-card skeleton" />
            ))}
          </div>
          <p className="admin-note">Loading dashboard…</p>
        </div>
      ) : error ? (
        <div className="admin-dash-error">
          <p className="admin-error">{error}</p>
          <button className="admin-btn" onClick={() => load()}>
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          <StatCards d={data} />

          <div className="admin-chart-grid">
            <motion.div
              className="admin-chart-card"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="admin-chart-head">
                <h3>Revenue Trend</h3>
                <span className="admin-chart-sub">Last {data.rangeDays} days</span>
              </div>
              <TrendLineChart data={data.daily} format={inrCompact} />
            </motion.div>

            <motion.div
              className="admin-chart-card"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="admin-chart-head">
                <h3>Sales Trend</h3>
                <span className="admin-chart-sub">Orders / day · last {data.rangeDays} days</span>
              </div>
              <TrendBarChart data={data.daily} />
            </motion.div>

            <motion.div
              className="admin-chart-card admin-chart-card-wide"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="admin-chart-head">
                <h3>Orders by Status</h3>
                <span className="admin-chart-sub">{num(data.stats.totalOrders)} total</span>
              </div>
              <StatusBreakdown data={data.byStatus} />
            </motion.div>
          </div>
        </>
      ) : null}
    </section>
  );
}
