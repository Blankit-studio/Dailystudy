/**
 * Shared authorization for the cron and admin endpoints.
 *
 * The secret may arrive either as the `Authorization: Bearer <secret>`
 * header (how Vercel Cron sends it) or as a `?secret=` query parameter
 * (handy for manual runs).
 *
 * Fails closed in production: if CRON_SECRET is missing there, the
 * request is rejected rather than allowed — otherwise a forgotten
 * environment variable would leave the destructive reset endpoint open.
 * Local development without a secret stays convenient.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) return process.env.NODE_ENV !== "production";

  if (request.headers.get("authorization") === `Bearer ${secret}`) return true;
  return new URL(request.url).searchParams.get("secret") === secret;
}
