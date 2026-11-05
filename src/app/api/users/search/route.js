import { NextResponse } from "next/server";
import { connection } from "next/server";
import { searchUsersAction } from "@/actions/profile";

export async function GET(request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const res = await searchUsersAction(query);
    return NextResponse.json(res, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API /api/users/search error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", users: [] },
      { status: 500 }
    );
  }
}
