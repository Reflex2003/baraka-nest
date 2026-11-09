import "server-only";

export function getBlobWriteAuthOptions(request: Request) {
  const configuredToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const token = configuredToken && !/^(your|replace|placeholder|paste)[_-]/i.test(configuredToken)
    ? configuredToken
    : undefined;
  const oidcToken = request.headers.get("x-vercel-oidc-token")?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim() || undefined;
  const storeId = process.env.BLOB_STORE_ID?.trim() || undefined;

  return {
    token,
    oidcToken: oidcToken && storeId ? oidcToken : undefined,
    storeId: oidcToken && storeId ? storeId : undefined,
  };
}

export function hasBlobWriteAuth(options: ReturnType<typeof getBlobWriteAuthOptions>) {
  return Boolean(options.token || (options.oidcToken && options.storeId));
}
