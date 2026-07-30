export function resolveAuthBaseUrl(env = process.env) {
  const candidates = [
    env.AUTH_URL,
    env.NEXTAUTH_URL,
    env.NEXTAUTH_URL_INTERNAL,
    env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
    env.URL,
  ].filter(Boolean);

  const firstCandidate = candidates[0];
  if (!firstCandidate) {
    return undefined;
  }

  if (firstCandidate.startsWith("http://") || firstCandidate.startsWith("https://")) {
    return firstCandidate;
  }

  return `https://${firstCandidate}`;
}
