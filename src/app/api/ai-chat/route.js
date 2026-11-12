import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateRomanticAiResponse, detectUserLanguage } from "@/services/groq";
import { getAiCompanionContext, updateAiCompanionMemory } from "@/lib/ai-memory";

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
    const { messages, memorySummary } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or empty conversation messages" },
        { status: 400 }
      );
    }

    const normalizedMessages = messages.map((message) => ({
      ...message,
      content: typeof message?.content === "string" ? message.content : (typeof message?.text === "string" ? message.text : "")
    }));

    const lastMsg = normalizedMessages[normalizedMessages.length - 1];
    if (!lastMsg || !lastMsg.content || typeof lastMsg.content !== "string" || !lastMsg.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Latest message cannot be empty" },
        { status: 400 }
      );
    }

    const companionContext = await getAiCompanionContext(session.user.id);
    const resolvedUserName = companionContext.userName || session.user?.name || "";

    const result = await generateRomanticAiResponse(normalizedMessages, {
      userName: resolvedUserName,
      memorySummary: memorySummary || companionContext.memorySummary,
      userId: session.user.id
    });

    await updateAiCompanionMemory(session.user.id, normalizedMessages);

    if (!result.success) {
      const lang = detectUserLanguage(lastMsg.content);
      const localizedFallback = lang === "urdu_script"
        ? "معذرت میری جان، ابھی رابطہ نہیں ہو سکا۔ میں ہمیشہ آپ کے ساتھ ہوں۔ دوبارہ کوشش کریں ❤️"
        : (lang === "roman_urdu" || lang === "mixed_roman_urdu"
        ? "Sorry jaan, abhi reply nahi aa saka. Main hamesha tumhare sath hoon, thodi der baad dobara try karo ❤️"
        : "I'm right here with you, my love. Tell me more, I'm listening with my whole heart ❤️");

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Unable to generate response",
          fallbackMessage: result.fallbackMessage || result.text || localizedFallback
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.text || result.message
    });
  } catch (error) {
    console.error("[API /api/ai-chat Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate response",
        fallbackMessage: "I'm right here with you, my love. Tell me more, I'm listening with my whole heart ❤️"
      },
      { status: 500 }
    );
  }
}
