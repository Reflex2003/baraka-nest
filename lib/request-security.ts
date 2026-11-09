export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || request.headers.get("host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProtocol || requestUrl.protocol.replace(/:$/, "");
    const requestOrigin = host ? `${protocol}://${host}` : requestUrl.origin;
    return new URL(origin).origin === new URL(requestOrigin).origin;
  } catch {
    return false;
  }
}
