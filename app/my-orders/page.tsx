"use client";

import { useEffect, useState } from "react";
import { ImageOff, ChevronRight, User, ClipboardList } from "lucide-react";
import Header from "../components/landing/Header";
import { fetchMyOrders, getSession, type MyOrder } from "../lib/api";

type Tab = "all" | "delivered" | "cancelled";

const DELIVERED_STATUSES = new Set(["DELIVERED"]);
const CANCELLED_STATUSES = new Set(["CANCELLED", "RETURNED"]);

function statusClass(status: string): string {
  const map: Record<string, string> = {
    PLACED: "placed",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  };
  return map[status] ?? "placed";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PLACED: "Order Placed",
    CONFIRMED: "Confirmed",
    PROCESSING: "Being Crafted",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
  };
  return map[status] ?? status;
}

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function filterOrders(orders: MyOrder[], tab: Tab): MyOrder[] {
  if (tab === "all") return orders;
  if (tab === "delivered") return orders.filter((o) => DELIVERED_STATUSES.has(o.status));
  if (tab === "cancelled") return orders.filter((o) => CANCELLED_STATUSES.has(o.status));
  return orders;
}

function OrderCard({ order }: { order: MyOrder }) {
  const firstItem = order.items[0];
  const extra = order.items.length - 1;

  return (
    <a href={`/my-orders/${order.id}`} className="order-card" style={{ textDecoration: "none" }}>
      <div className="order-card-thumb">
        {firstItem?.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={firstItem.image} alt={firstItem.name} />
        ) : (
          <div className="order-card-thumb-placeholder">
            <ImageOff strokeWidth={1.5} className="size-8 opacity-30" />
          </div>
        )}
      </div>

      <div className="order-card-body">
        <div className="order-card-top">
          <div className="order-card-head">
            <div className="order-card-no">{order.no}</div>
            <div className="order-card-meta">{fmtDate(order.placedAt)}</div>
          </div>
          <span className={`status-badge ${statusClass(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="order-card-bottom">
          <div className="order-card-items">
            {firstItem?.name ?? "—"}
            {extra > 0 && ` + ${extra} more`}
          </div>
          <div className="order-card-amount">{inr(order.total)}</div>
        </div>
      </div>

      <div className="order-card-chev" aria-hidden="true">
        <ChevronRight strokeWidth={2} />
      </div>
    </a>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    let alive = true;
    getSession().then((user) => {
      if (!alive) return;
      if (!user) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      fetchMyOrders()
        .then((data) => {
          if (alive) setOrders(data);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    });
    return () => {
      alive = false;
    };
  }, []);

  const allCount = orders.length;
  const deliveredCount = orders.filter((o) => DELIVERED_STATUSES.has(o.status)).length;
  const cancelledCount = orders.filter((o) => CANCELLED_STATUSES.has(o.status)).length;

  const visible = filterOrders(orders, tab);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Orders", count: allCount },
    { id: "delivered", label: "Delivered", count: deliveredCount },
    { id: "cancelled", label: "Cancelled", count: cancelledCount },
  ];

  const emptyMessages: Record<Tab, { heading: string; body: string }> = {
    all: {
      heading: "No orders yet",
      body: "When you place an order it will appear here.",
    },
    delivered: {
      heading: "No delivered orders",
      body: "Your delivered orders will show up here.",
    },
    cancelled: {
      heading: "No cancelled orders",
      body: "You haven't cancelled any orders.",
    },
  };

  if (loading) {
    return (
      <main className="av orders-page">
        <Header />
        <section className="orders-shell">
          <div className="order-loading">Loading your orders…</div>
        </section>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="av orders-page">
        <Header />
        <section className="orders-shell">
          <div className="orders-empty" style={{ marginTop: 0, border: "1px solid var(--line)" }}>
            <User strokeWidth={1.5} />
            <h3>Sign in to view your orders</h3>
            <p>Your order history and tracking appear here once you're logged in.</p>
            <a href="/login">Log in</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="av orders-page">
      <Header />
      <section className="orders-shell">
        {/* page head */}
        <header className="orders-hero">
          <p className="orders-kicker">My Account</p>
          <h1>My Orders</h1>
          <p>
            {allCount === 0
              ? "No orders placed yet."
              : `${allCount} order${allCount !== 1 ? "s" : ""} · crafted in Jaipur`}
          </p>
        </header>

        {/* tabs */}
        <div className="orders-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`orders-tab${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="orders-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* list */}
        {visible.length === 0 ? (
          <div className="orders-list">
            <div className="orders-empty">
              <ClipboardList strokeWidth={1.5} />
              <h3>{emptyMessages[tab].heading}</h3>
              <p>{emptyMessages[tab].body}</p>
              {tab === "all" && <a href="/">Start Shopping</a>}
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {visible.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
