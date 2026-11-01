export function resolveAuthBaseUrl(env = process.env) {
  const candidates = [
    env.AUTH_URL,
    env.NEXTAUTH_URL,
    env.NEXTAUTH_URL_INTERNAL,
    env.NEXT_PUBLIC_APP_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
    env.URL,
  ].filter(Boolean).filter((candidate) => {
    if (env.NODE_ENV !== "production") return true;

    try {
      const { hostname } = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
      return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1";
    } catch {
      return false;
    }
  });

  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    return undefined;
  }

  if (firstCandidate.startsWith("http://") || firstCandidate.startsWith("https://")) {
    return firstCandidate;
  }

  return `https://${firstCandidate}`;
}
