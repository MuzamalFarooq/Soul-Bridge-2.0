import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateRomanticAiResponse } from "@/services/groq";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or empty conversation messages" },
        { status: 400 }
      );
    }

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !lastMsg.content || typeof lastMsg.content !== "string" || !lastMsg.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Latest message cannot be empty" },
        { status: 400 }
      );
    }

    const result = await generateRomanticAiResponse(messages);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Unable to generate response",
          fallbackMessage: result.fallbackMessage || "Sorry, I couldn't reply right now. Please try again ❤️"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("[API /api/ai-chat Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate response",
        fallbackMessage: "Sorry, I couldn't reply right now. Please try again ❤️"
      },
      { status: 500 }
    );
  }
}
