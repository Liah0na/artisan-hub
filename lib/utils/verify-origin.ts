/**
 * Lightweight CSRF defense for JSON API routes that rely on the next-auth
 * session cookie. Browsers attach an `Origin` header to same-origin and
 * cross-origin fetch requests alike (including POST/PATCH/DELETE), so
 * comparing it against the request's own `Host` header reliably rejects
 * cross-site form/script submissions while never affecting legitimate
 * same-origin calls made by this app's own client code.
 *
 * This is defense-in-depth on top of next-auth's SameSite=Lax session
 * cookie (already the main CSRF mitigation) and, on sensitive routes, an
 * explicit password/secret re-confirmation.
 *
 * Deliberately NOT applied to /api/bootstrap/superadmin, which is meant to
 * be invoked via curl/CI right after deploy — it has no browser Origin and
 * is protected by its own shared secret instead (see that route).
 */
export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function originRejectedResponse() {
  return Response.json({ error: "Origem da requisição não permitida." }, { status: 403 });
}
