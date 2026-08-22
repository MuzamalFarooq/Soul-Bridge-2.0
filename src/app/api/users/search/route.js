import { NextResponse } from "next/server";
import { searchUsersAction } from "@/actions/profile";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const res = await searchUsersAction(query);
    return NextResponse.json(res);
  } catch (error) {
    console.error("API /api/users/search error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", users: [] },
      { status: 500 }
    );
  }
}
