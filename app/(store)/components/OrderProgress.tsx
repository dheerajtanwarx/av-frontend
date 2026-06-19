/** Live, status-driven order tracker. Shared by the My Orders detail page and
    the public Track Your Order result so both render the same journey from a
    real order status fetched from the backend. */
import { Check, X } from "lucide-react";

export function statusLabel(status: string): string {
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

const JOURNEY = [
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Crafting" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

const STATUS_ORDER = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

function CheckIcon() {
  return <Check strokeWidth={2.5} />;
}

/* Small filled status dot for the current step — no lucide equivalent. */
function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function CrossIcon() {
  return <X strokeWidth={2.5} />;
}

type StepState = "done" | "current" | "upcoming" | "cancelled";

function getStepState(stepKey: string, orderStatus: string): StepState {
  if (["CANCELLED", "RETURNED"].includes(orderStatus)) return "cancelled";
  const currentIdx = STATUS_ORDER.indexOf(orderStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepKey);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

export default function OrderProgress({ status }: { status: string }) {
  const isCancelled = ["CANCELLED", "RETURNED"].includes(status);

  if (isCancelled) {
    return (
      <div className="order-progress">
        <div className="order-progress-steps" style={{ justifyContent: "center", gap: 12 }}>
          <div className="order-progress-step cancelled" style={{ flexDirection: "row", flex: "none", gap: 10 }}>
            <div className="order-progress-dot">
              <CrossIcon />
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="order-progress-label" style={{ textTransform: "none", letterSpacing: 0, fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                {statusLabel(status)}
              </div>
              <div style={{ fontFamily: "var(--font-jost)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                This order has been {status.toLowerCase()}.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-progress">
      <div className="order-progress-steps">
        {JOURNEY.map((step) => {
          const state = getStepState(step.key, status);
          return (
            <div key={step.key} className={`order-progress-step ${state}`}>
              <div className="order-progress-dot">
                {state === "done" ? <CheckIcon /> : state === "current" ? <DotIcon /> : null}
              </div>
              <div className="order-progress-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
