const fallbackSecret = "soul-bridge-jwt-super-secret-key-development-2026";

export function getAuthSecret(env = process.env) {
  return env.NEXTAUTH_SECRET || env.AUTH_SECRET || fallbackSecret;
}
