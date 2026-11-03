import { NextResponse } from "next/server";

const sessionCookieNames = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export async function POST() {
  const response = NextResponse.json({ success: true });

  for (const cookieName of sessionCookieNames) {
    response.cookies.delete(cookieName);
  }

  return response;
}
