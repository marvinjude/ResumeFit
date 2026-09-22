import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "resumefit_session";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Safe to call from Server Components or Route Handlers — read-only. */
export async function readSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Route Handlers only — Next.js does not allow setting cookies from a
 * Server Component render. Creates and persists an anonymous session id
 * the first time it's called for a browser, and reuses it after.
 */
export async function ensureSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
  });
  return id;
}
