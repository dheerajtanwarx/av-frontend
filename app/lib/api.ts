/* ============================================================
   AV Creation — backend API client
   ------------------------------------------------------------
   Thin typed wrapper around the Express API (default :4000).
   Cookies are sent (credentials: "include") so the auth-gated
   routes work once a NextAuth/Google session cookie is present.
   ============================================================ */

import type { Category, Product } from "./landing-data";
import type { PdpProduct, PdpReview } from "./pdp-data";
import type { OrderAddress } from "./cart-data";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FetchOpts = { cache?: RequestCache; signal?: AbortSignal };

async function apiGet<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: opts.cache ?? "no-store",
    signal: opts.signal,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await safeError(res));
  }
  return res.json() as Promise<T>;
}

async function apiSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await safeError(res));
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function safeError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

/* ---------- Catalog (public) ---------- */

export type ApiCategory = Category & { slug: string };

export function fetchProducts(
  params: { category?: string; bestseller?: boolean } = {},
  opts?: FetchOpts
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.bestseller) qs.set("bestseller", "true");
  const q = qs.toString();
  return apiGet<Product[]>(`/api/products${q ? `?${q}` : ""}`, opts);
}

export function fetchProduct(slug: string, opts?: FetchOpts): Promise<PdpProduct> {
  return apiGet<PdpProduct>(`/api/products/${encodeURIComponent(slug)}`, opts);
}

export function fetchCategories(opts?: FetchOpts): Promise<ApiCategory[]> {
  return apiGet<ApiCategory[]>(`/api/categories`, opts);
}

export type ReviewsResponse = {
  reviews: PdpReview[];
  reviewDist: [string, number][];
  count: number;
};

export function fetchReviews(slug: string, opts?: FetchOpts): Promise<ReviewsResponse> {
  return apiGet<ReviewsResponse>(
    `/api/products/${encodeURIComponent(slug)}/reviews`,
    opts
  );
}

/* ---------- Promo + newsletter (public) ---------- */

export type PromoResult =
  | { ok: true; pct: number; label: string }
  | { ok: false; error?: string };

export function validatePromo(code: string, subtotal: number): Promise<PromoResult> {
  return apiSend<PromoResult>("POST", `/api/promos/validate`, { code, subtotal });
}

export function subscribeNewsletter(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  return apiSend("POST", `/api/newsletter`, { email });
}

/* ---------- Orders ---------- */

export type PlaceOrderInput = {
  items: { slug: string; color: string; size: string; qty: number }[];
  address: OrderAddress;
  payment: string; // upi | card | netbanking | cod
  delivery: string; // standard | priority
  promoCode?: string | null;
};

export type PlaceOrderResponse = {
  no: string;
  id: number;
  eta: string;
  etaWindow: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: string;
};

export function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResponse> {
  return apiSend<PlaceOrderResponse>("POST", `/api/orders`, input);
}

export function fetchMyOrders(): Promise<unknown[]> {
  return apiGet<unknown[]>(`/api/orders`);
}

/* ---------- Auth (Google OAuth lives on the backend) ---------- */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  providers?: string[];
};

export async function getSession(): Promise<SessionUser | null> {
  try {
    const { user } = await apiGet<{ user: SessionUser }>(`/api/auth/me`);
    return user;
  } catch {
    return null;
  }
}

/** Full-page redirect into the backend Google OAuth flow. */
export function loginWithGoogle(): void {
  window.location.href = `${API_URL}/api/auth/google`;
}

export function logout(): Promise<{ success: boolean }> {
  return apiSend("POST", `/api/auth/logout`);
}

/* ---------- Phone OTP (dev mock) ---------- */

export type AuthMode = "login" | "signup";

/** Request an OTP. In dev the backend returns the code as `devOtp`. */
export function sendOtp(
  phone: string,
  mode: AuthMode
): Promise<{ ok: boolean; devOtp?: string }> {
  return apiSend("POST", `/api/auth/otp/send`, { phone, mode });
}

/** Verify an OTP; on success the backend sets the av_token cookie. */
export function verifyOtp(
  phone: string,
  otp: string,
  mode: AuthMode,
  name?: string
): Promise<{ user: SessionUser }> {
  return apiSend("POST", `/api/auth/otp/verify`, { phone, otp, mode, name });
}

/* ---------- Cart (auth-gated; guests stay on localStorage) ---------- */

export type ServerCartItem = {
  id: number;
  variantId: number;
  slug: string;
  name: string;
  type: string | null;
  color: { name: string; hex: string };
  qty: number;
  unitPrice: number;
  price: string;
  img: string;
};

export function fetchServerCart(): Promise<ServerCartItem[]> {
  return apiGet<ServerCartItem[]>(`/api/cart`);
}

export function mergeServerCart(
  items: { slug: string; color?: string; qty: number }[]
): Promise<ServerCartItem[]> {
  return apiSend<ServerCartItem[]>("POST", `/api/cart/merge`, { items });
}
