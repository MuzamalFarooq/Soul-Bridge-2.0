export function resolveAuthBaseUrl(env = process.env) {
  // If the production domain is defined anywhere in the env candidates, prioritize it
  const productionDomain = "https://soulbridge.muzamal.site";

  // Check explicit public app URL or production indicators
  if (
    env.NEXT_PUBLIC_APP_URL?.includes("soulbridge.muzamal.site") ||
    env.AUTH_URL?.includes("soulbridge.muzamal.site") ||
    env.NEXTAUTH_URL?.includes("soulbridge.muzamal.site")
  ) {
    return productionDomain;
  }

  const isProduction =
    env.NODE_ENV === "production" ||
    Boolean(env.VERCEL) ||
    Boolean(env.NEXT_PUBLIC_APP_URL?.startsWith("https://"));

  const candidates = [
    env.AUTH_URL,
    env.NEXTAUTH_URL,
    env.NEXTAUTH_URL_INTERNAL,
    env.NEXT_PUBLIC_APP_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
    env.URL,
  ].filter(Boolean).filter((candidate) => {
    if (!isProduction) return true;

    try {
      const { hostname } = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
      return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1";
    } catch {
      return false;
    }
  });

  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    return isProduction ? productionDomain : "http://localhost:3000";
  }

  if (firstCandidate.startsWith("http://") || firstCandidate.startsWith("https://")) {
    return firstCandidate;
  }

  return `https://${firstCandidate}`;
}
