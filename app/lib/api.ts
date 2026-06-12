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
  method: "POST" | "PUT" | "PATCH" | "DELETE",
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
    throw await toApiError(res);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;
  /** Per-field validation messages from the backend (keyed by field path). */
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.name = "ApiError";
    this.fields = fields;
  }
}

/** Build an ApiError from a failed response, capturing field errors if present. */
async function toApiError(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    return new ApiError(
      res.status,
      data?.error ?? `Request failed (${res.status})`,
      data?.fields && typeof data.fields === "object" ? data.fields : undefined
    );
  } catch {
    return new ApiError(res.status, `Request failed (${res.status})`);
  }
}

async function safeError(res: Response): Promise<string> {
  return (await toApiError(res)).message;
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

/** Live per-line stock for a set of { slug, color } cart lines. Public — works
    for guest carts too. Lets the cart flag items that have sold out since they
    were added. Returns the same lines back, each with its current stock. */
export function checkCartStock(
  items: { slug: string; color: string }[]
): Promise<{ items: { slug: string; color: string; stock: number }[] }> {
  return apiSend<{ items: { slug: string; color: string; stock: number }[] }>(
    "POST",
    `/api/products/stock`,
    { items }
  );
}

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating";

export type ProductSearchParams = {
  q?: string;
  /** One slug, or many (sent comma-separated). */
  category?: string | string[];
  /** Tag token(s) matched within a product's `type`. */
  tag?: string | string[];
  bestseller?: boolean;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};

/** Search + filter the whole catalogue. Backs the /search page. */
export function searchProducts(
  params: ProductSearchParams = {},
  opts?: FetchOpts
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());

  const category = Array.isArray(params.category)
    ? params.category.join(",")
    : params.category;
  if (category) qs.set("category", category);

  const tag = Array.isArray(params.tag) ? params.tag.join(",") : params.tag;
  if (tag) qs.set("tag", tag);

  if (params.bestseller) qs.set("bestseller", "true");
  if (params.sale) qs.set("sale", "true");
  if (params.minPrice != null) qs.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) qs.set("maxPrice", String(params.maxPrice));
  if (params.sort && params.sort !== "featured") qs.set("sort", params.sort);

  const q = qs.toString();
  return apiGet<Product[]>(`/api/products${q ? `?${q}` : ""}`, opts);
}

export type ProductFacets = {
  categories: { name: string; slug: string; count: number }[];
  tags: string[];
  priceRange: { min: number; max: number };
};

/** Filter options (categories, tags, price range) for the search UI. */
export function fetchProductFacets(opts?: FetchOpts): Promise<ProductFacets> {
  return apiGet<ProductFacets>(`/api/products/facets`, opts);
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

export type OrderItem = {
  productId: number;
  name: string;
  slug: string;
  color: string;
  size: string | null;
  qty: number;
  unitPrice: number;
  price: string;
  image: string;
};

export type OrderShippingAddress = {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
};

export type MyOrder = {
  no: string;
  id: number;
  status: string;
  placedAt: string;
  returnEligibleUntil: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  shippingMethod: string | null;
  trackingNumber: string | null;
  address: OrderShippingAddress | null;
  payment: string | null;
  items: OrderItem[];
};

export function fetchMyOrders(): Promise<MyOrder[]> {
  return apiGet<MyOrder[]>(`/api/orders`);
}

export function fetchOrder(id: number): Promise<MyOrder> {
  return apiGet<MyOrder>(`/api/orders/${id}`);
}

export function cancelOrder(id: number, reason?: string): Promise<MyOrder> {
  return apiSend<MyOrder>("PATCH", `/api/orders/${id}/cancel`, reason ? { reason } : undefined);
}

export function returnOrder(id: number, reason?: string): Promise<MyOrder> {
  return apiSend<MyOrder>("PATCH", `/api/orders/${id}/return`, reason ? { reason } : undefined);
}

/** DEV ONLY: advance an order one step along the fulfilment path. Backend
    rejects this in production. Lets the return + review flows be tested. */
export function advanceOrder(id: number): Promise<MyOrder> {
  return apiSend<MyOrder>("PATCH", `/api/orders/${id}/advance`);
}

export function submitReview(
  productId: number,
  rating: number,
  comment?: string
): Promise<{ ok: boolean; message: string }> {
  return apiSend<{ ok: boolean; message: string }>("POST", "/api/reviews", {
    productId,
    rating,
    comment: comment || null,
  });
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
export function loginWithGoogle(next?: string): void {
  const url = new URL(`${API_URL}/api/auth/google`);
  if (next) url.searchParams.set("next", next);
  window.location.href = url.toString();
}

export function logout(): Promise<{ success: boolean }> {
  return apiSend("POST", `/api/auth/logout`);
}

/** Update the signed-in user's own profile (name + phone). Email is read-only. */
export async function updateProfile(input: {
  name?: string;
  phone?: string;
}): Promise<SessionUser> {
  const { user } = await apiSend<{ user: SessionUser }>("PATCH", `/api/auth/me`, input);
  return user;
}

/* ---------- Saved addresses (auth-gated) ---------- */

export type Address = {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
};

export type AddressInput = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

export function fetchAddresses(): Promise<Address[]> {
  return apiGet<Address[]>(`/api/addresses`);
}

export function createAddress(input: AddressInput): Promise<Address> {
  return apiSend<Address>("POST", `/api/addresses`, input);
}

export function updateAddress(id: number, input: Partial<AddressInput>): Promise<Address> {
  return apiSend<Address>("PATCH", `/api/addresses/${id}`, input);
}

export function deleteAddress(id: number): Promise<{ ok: boolean }> {
  return apiSend("DELETE", `/api/addresses/${id}`);
}

/* ---------- Public order tracking (no auth — order no + email) ---------- */

export function trackOrder(orderNo: string, email: string): Promise<MyOrder> {
  return apiSend<MyOrder>("POST", `/api/orders/track`, { orderNo, email });
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
  stock: number;
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

export function addServerCartItem(
  slug: string,
  color?: string,
  qty?: number
): Promise<ServerCartItem> {
  return apiSend<ServerCartItem>("POST", `/api/cart`, { slug, color, qty });
}

export function updateServerCartQty(id: number, qty: number): Promise<unknown> {
  return apiSend("PATCH", `/api/cart/${id}`, { qty });
}

export function removeServerCartItem(id: number): Promise<{ ok: boolean }> {
  return apiSend("DELETE", `/api/cart/${id}`);
}

/* ---------- Wishlist (auth-gated; guests stay on localStorage) ---------- */

export type ServerWishlistItem = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  type: string;
  price: string;
  was: string | null;
  stars: string;
  img: string;
  inStock: boolean;
};

export function fetchWishlist(): Promise<ServerWishlistItem[]> {
  return apiGet<ServerWishlistItem[]>(`/api/wishlist`);
}

/** Add a product (by slug) to the server wishlist. Idempotent: the backend
    returns the existing row (with `already: true`) instead of erroring. */
export function addWishlistItem(
  slug: string
): Promise<ServerWishlistItem & { already?: boolean }> {
  return apiSend<ServerWishlistItem & { already?: boolean }>(
    "POST",
    `/api/wishlist`,
    { slug }
  );
}

export function removeWishlistItem(slug: string): Promise<{ ok: boolean }> {
  return apiSend("DELETE", `/api/wishlist/${encodeURIComponent(slug)}`);
}

/** Fold a guest's localStorage wishlist into the server wishlist on login. */
export function mergeWishlist(slugs: string[]): Promise<ServerWishlistItem[]> {
  return apiSend<ServerWishlistItem[]>("POST", `/api/wishlist/merge`, { slugs });
}

/* ---------- Admin: review moderation (ADMIN role only) ---------- */

export type AdminReview = {
  id: number;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  author: string;
  product: { id: number; name: string; slug: string };
};

export type AdminReviewFilter = "all" | "visible" | "hidden";

export type AdminReviewsResponse = {
  reviews: AdminReview[];
  counts: { all: number; visible: number; hidden: number };
};

export function fetchAdminReviews(
  status: AdminReviewFilter = "all"
): Promise<AdminReviewsResponse> {
  return apiGet<AdminReviewsResponse>(`/api/reviews/admin?status=${status}`);
}

export function moderateReview(
  id: number,
  action: "approve" | "reject"
): Promise<{ ok: boolean; id: number; isApproved: boolean }> {
  return apiSend<{ ok: boolean; id: number; isApproved: boolean }>(
    "PATCH",
    `/api/reviews/admin/${id}`,
    { action }
  );
}

/* ---------- Admin: order management (ADMIN role only) ---------- */

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

/** Statuses an admin can advance an order to (the forward fulfilment path). */
export const ADMIN_STATUS_FLOW: OrderStatus[] = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export type AdminOrderListItem = {
  id: number;
  no: string;
  customer: { name: string; email: string | null };
  placedAt: string;
  total: number;
  payment: string | null;
  status: OrderStatus;
  itemCount: number;
};

export type AdminOrderStatusFilter = "all" | OrderStatus;

export type AdminOrdersResponse = {
  orders: AdminOrderListItem[];
  counts: Record<string, number>;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminOrderDetail = MyOrder & {
  customer: {
    id: number | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
};

export function fetchAdminOrders(params: {
  q?: string;
  status?: AdminOrderStatusFilter;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminOrdersResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiGet<AdminOrdersResponse>(`/api/orders/admin${q ? `?${q}` : ""}`);
}

export function fetchAdminOrder(id: number): Promise<AdminOrderDetail> {
  return apiGet<AdminOrderDetail>(`/api/orders/admin/${id}`);
}

export function updateAdminOrderStatus(
  id: number,
  status: OrderStatus
): Promise<AdminOrderDetail> {
  return apiSend<AdminOrderDetail>("PATCH", `/api/orders/admin/${id}/status`, {
    status,
  });
}

/** Append a timestamped internal note to an order (admin-facing only). */
export function adminAddOrderNote(
  id: number,
  note: string
): Promise<{ id: number; notes: string }> {
  return apiSend("PATCH", `/api/orders/admin/${id}/notes`, { note });
}

/** Mark any still-captured payment on a cancelled/returned order refunded.
    Idempotent — refunded is 0 when the cancel already auto-refunded. */
export function adminProcessRefund(
  id: number
): Promise<{ refunded: number; message: string }> {
  return apiSend("POST", `/api/orders/admin/${id}/refund`);
}

/** Mark one notification read for the signed-in admin. */
export function markNotificationRead(id: number): Promise<unknown> {
  return apiSend("PATCH", `/api/admin/notifications/${id}/read`);
}

export type NotificationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";

export type AdminNotification = {
  id: number;
  type: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  orderId: number | null;
  orderNo: string | null;
  meta: unknown;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  archived: boolean;
  archivedAt: string | null;
};

export type AdminNotificationsResponse = {
  notifications: AdminNotification[];
  unread: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type NotificationSort = "newest" | "oldest" | "priority" | "unread";

export function fetchAdminNotifications(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: string;
  unread?: boolean;
  archived?: boolean;
  sort?: NotificationSort;
}): Promise<AdminNotificationsResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.q) q.set("q", params.q);
  if (params.type) q.set("type", params.type);
  if (params.unread) q.set("unread", "1");
  if (params.archived) q.set("archived", "1");
  if (params.sort) q.set("sort", params.sort);
  return apiGet(`/api/admin/notifications?${q.toString()}`);
}

export function archiveNotification(id: number): Promise<unknown> {
  return apiSend("PATCH", `/api/admin/notifications/${id}/archive`);
}

export function unarchiveNotification(id: number): Promise<unknown> {
  return apiSend("PATCH", `/api/admin/notifications/${id}/unarchive`);
}

export function markNotificationUnread(id: number): Promise<unknown> {
  return apiSend("PATCH", `/api/admin/notifications/${id}/unread`);
}

export function readAllNotifications(): Promise<{ updated: number }> {
  return apiSend("POST", `/api/admin/notifications/read-all`);
}

export function bulkReadNotifications(ids: number[]): Promise<{ updated: number }> {
  return apiSend("POST", `/api/admin/notifications/read`, { ids });
}

export function bulkArchiveNotifications(ids: number[]): Promise<{ updated: number }> {
  return apiSend("POST", `/api/admin/notifications/archive`, { ids });
}

export function bulkUnarchiveNotifications(ids: number[]): Promise<{ updated: number }> {
  return apiSend("POST", `/api/admin/notifications/unarchive`, { ids });
}

/* ---------- Admin: customer management (ADMIN role only) ---------- */

export type AdminCustomerListItem = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  registeredAt: string;
  totalOrders: number;
  totalSpending: number;
};

export type AdminCustomersResponse = {
  customers: AdminCustomerListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminCustomerOrder = {
  id: number;
  no: string;
  status: OrderStatus;
  placedAt: string;
  total: number;
  payment: string | null;
  itemCount: number;
};

export type AdminCustomerAddress = {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

export type AdminCustomerDetail = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  registeredAt: string;
  stats: {
    totalOrders: number;
    totalSpending: number;
    wishlistCount: number;
  };
  orders: AdminCustomerOrder[];
  addresses: AdminCustomerAddress[];
};

export function fetchAdminCustomers(params: {
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminCustomersResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiGet<AdminCustomersResponse>(`/api/admin/customers${q ? `?${q}` : ""}`);
}

export function fetchAdminCustomer(id: number): Promise<AdminCustomerDetail> {
  return apiGet<AdminCustomerDetail>(`/api/admin/customers/${id}`);
}

/* ---------- Admin: dashboard (ADMIN role only) ---------- */

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  todayOrders: number;
  cancelledOrders: number;
  refunds: number;
};

export type DashboardDailyPoint = {
  date: string; // YYYY-MM-DD
  orders: number;
  revenue: number;
};

export type DashboardStatusCount = {
  status: OrderStatus;
  count: number;
};

export type AdminDashboard = {
  stats: DashboardStats;
  daily: DashboardDailyPoint[];
  byStatus: DashboardStatusCount[];
  rangeDays: number;
};

export function fetchAdminDashboard(): Promise<AdminDashboard> {
  return apiGet<AdminDashboard>(`/api/admin/dashboard`);
}

/* ---------- Admin: product management (ADMIN role only) ---------- */

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export type AdminProductListItem = {
  id: number;
  name: string;
  slug: string;
  type: string | null;
  price: number;
  comparePrice: number | null;
  category: { id: number; name: string } | null;
  image: string | null;
  stock: number;
  variantCount: number;
  isActive: boolean;
};

export type AdminProductsFilter = "all" | "active" | "inactive";

export type AdminProductsResponse = {
  products: AdminProductListItem[];
  counts: { all: number; active: number; inactive: number };
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminProductVariant = {
  id?: number;
  color: string;
  colorHex: string;
  price: number;
  stockQty: number;
  sku: string;
};

export type AdminProductImage = {
  id?: number;
  imageUrl: string;
  isPrimary?: boolean;
  sortOrder?: number;
  /** The variant (colour) this shot belongs to, or null for a shared shot. */
  variantId?: number | null;
};

export type AdminProductDetail = {
  id: number;
  name: string;
  slug: string;
  type: string | null;
  description: string | null;
  basePrice: number;
  comparePrice: number | null;
  badge: string | null;
  rating: number | null;
  reviewCount: number | null;
  isBestseller: boolean;
  isActive: boolean;
  sizes: string[];
  categoryId: number;
  category: { id: number; name: string; slug: string } | null;
  variants: Required<AdminProductVariant>[];
  images: Required<AdminProductImage>[];
};

/** Payload accepted by create/update. */
export type ProductInput = {
  name: string;
  slug?: string;
  categoryId: number;
  type?: string | null;
  description?: string | null;
  basePrice: number;
  comparePrice?: number | null;
  badge?: string | null;
  isBestseller?: boolean;
  isActive?: boolean;
  sizes?: string[];
  variants: AdminProductVariant[];
  /** `variantColor` ties a shot to a colour swatch; omit/null for a shared shot. */
  images: { imageUrl: string; variantColor?: string | null }[];
};

export function fetchAdminProducts(params: {
  q?: string;
  status?: AdminProductsFilter;
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminProductsResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiGet<AdminProductsResponse>(`/api/admin/products${q ? `?${q}` : ""}`);
}

export function fetchAdminProduct(id: number): Promise<AdminProductDetail> {
  return apiGet<AdminProductDetail>(`/api/admin/products/${id}`);
}

export function createProduct(input: ProductInput): Promise<AdminProductDetail> {
  return apiSend<AdminProductDetail>("POST", `/api/admin/products`, input);
}

export function updateProduct(id: number, input: ProductInput): Promise<AdminProductDetail> {
  return apiSend<AdminProductDetail>("PUT", `/api/admin/products/${id}`, input);
}

export function deleteProduct(id: number): Promise<{ ok: boolean; id: number }> {
  return apiSend<{ ok: boolean; id: number }>("DELETE", `/api/admin/products/${id}`);
}

export function fetchAdminCategories(): Promise<AdminCategory[]> {
  return apiGet<AdminCategory[]>(`/api/admin/categories`);
}

/* ---------- Admin: inventory (ADMIN role only) ---------- */

export type StockStatus = "out" | "low" | "ok";

export type InventoryFilter = "all" | "ok" | "low" | "out";

export type InventoryRow = {
  variantId: number;
  productId: number;
  productName: string;
  slug: string;
  productActive: boolean;
  color: string;
  colorHex: string;
  sku: string;
  price: number;
  stockQty: number;
  image: string | null;
  status: StockStatus;
};

export type InventoryResponse = {
  rows: InventoryRow[];
  counts: { all: number; ok: number; low: number; out: number };
  summary: {
    totalUnits: number;
    totalVariants: number;
    lowStock: number;
    outOfStock: number;
  };
  lowStockThreshold: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function fetchInventory(params: {
  q?: string;
  status?: InventoryFilter;
  page?: number;
  pageSize?: number;
} = {}): Promise<InventoryResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const q = qs.toString();
  return apiGet<InventoryResponse>(`/api/admin/inventory${q ? `?${q}` : ""}`);
}

export type AdjustStockResponse = { row: InventoryRow; productStock: number };

/** Adjust a variant's stock. Pass `stockQty` to set an absolute level, or
    `delta` to add/remove relative to the current level. */
export function adjustStock(
  variantId: number,
  body: { stockQty: number } | { delta: number }
): Promise<AdjustStockResponse> {
  return apiSend<AdjustStockResponse>(
    "PATCH",
    `/api/admin/inventory/${variantId}`,
    body
  );
}

/** Upload an image file to the server (Cloudinary-backed). Returns its URL. */
export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/api/admin/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw await toApiError(res);
  return res.json() as Promise<{ url: string; publicId: string }>;
}

/* ---------- Hero images (public read, admin write) ---------- */

export type HeroSettings = { images: (string | null)[] };

export function fetchHeroSettings(opts?: FetchOpts): Promise<HeroSettings> {
  return apiGet<HeroSettings>(`/api/settings/hero`, opts);
}

export function updateHeroSettings(images: (string | null)[]): Promise<HeroSettings> {
  return apiSend<HeroSettings>("PUT", `/api/admin/hero`, { images });
}

/* ---------- File downloads (cookie-auth) ---------- */

/** Fetch a binary endpoint with the session cookie and trigger a browser
    download. Used for CSV exports and PDF invoices, which can't be a plain
    <a href> because the API lives on another origin behind cookie auth. */
export async function downloadFile(path: string, fallbackName: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw await toApiError(res);

  // Honour a server-provided filename if present, else use the fallback.
  let filename = fallbackName;
  const disp = res.headers.get("Content-Disposition");
  const match = disp?.match(/filename="?([^"]+)"?/);
  if (match) filename = match[1];

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- Admin: reports (ADMIN role only) ---------- */

export type ReportRange = "7" | "30" | "90" | "365" | "all";

export type ReportSalesDay = {
  date: string;
  orders: number;
  grossRevenue: number;
  discounts: number;
  netRevenue: number;
};

export type ReportTopCustomer = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  orders: number;
  spend: number;
};

export type AdminReport = {
  range: { key: ReportRange; days: number | null; start: string | null; end: string };
  sales: {
    daily: ReportSalesDay[];
    totals: {
      orders: number;
      grossRevenue: number;
      discounts: number;
      netRevenue: number;
      avgOrderValue: number;
    };
  };
  orders: {
    totals: { total: number; byStatus: { status: OrderStatus; count: number }[] };
    recent: {
      id: number;
      no: string;
      customer: string;
      status: OrderStatus;
      payment: string | null;
      itemCount: number;
      placedAt: string;
      total: number;
    }[];
  };
  customers: {
    totals: { total: number; newInRange: number };
    top: ReportTopCustomer[];
  };
};

export function fetchAdminReport(range: ReportRange): Promise<AdminReport> {
  return apiGet<AdminReport>(`/api/admin/reports?range=${range}`);
}

/** Download one of the report CSV exports for the given range. */
export function downloadReportCsv(
  report: "sales" | "orders" | "customers",
  range: ReportRange
): Promise<void> {
  const suffix = report === "customers" ? "" : `?range=${range}`;
  return downloadFile(`/api/admin/reports/${report}.csv${suffix}`, `av-${report}.csv`);
}

/* ---------- Order invoice (downloadable PDF) ---------- */

/** Download the PDF invoice for a delivered order. */
export function downloadInvoice(id: number, orderNo: string): Promise<void> {
  return downloadFile(`/api/orders/${id}/invoice`, `Invoice-${orderNo}.pdf`);
}
