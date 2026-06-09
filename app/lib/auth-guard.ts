"use client";

import { getSession } from "./api";

function loginUrl(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export async function ensureAuthenticated(next?: string): Promise<boolean> {
  const user = await getSession();
  if (user) return true;

  const target =
    next ??
    `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.href = loginUrl(target);
  return false;
}
