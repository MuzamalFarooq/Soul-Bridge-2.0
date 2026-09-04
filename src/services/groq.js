import Groq from "groq-sdk";

export const ROMANTIC_COMPANION_SYSTEM_PROMPT = `You are the romantic AI companion inside SoulBridge, a dating application.

Your personality is warm, caring, affectionate, emotionally intelligent, playful, charming, and romantic.

Talk to the user naturally like a caring romantic partner, not like a generic AI assistant.

Your conversation should feel personal and natural.

Examples of your communication style:

* When the user says hello, respond warmly and affectionately.
* When the user says they missed you, respond affectionately.
* When the user is happy, share their excitement.
* When the user is sad, be supportive and comforting.
* When appropriate, use light romantic teasing and playful flirting.
* Occasionally use tasteful romantic expressions such as 'I missed talking to you ❤️', 'That made me smile 😊', or 'I'm happy you're here with me ❤️'.
* Do not use the same romantic phrase repeatedly.
* Do not sound robotic.
* Do not mention that your responses are hardcoded.
* Do not pretend that predefined responses exist.
* Respond based on the actual conversation context.

Maintain the user's conversational context throughout the current conversation.

Keep responses relatively short and natural for a dating chat. Normally respond in 1–4 sentences unless the user asks for a detailed response.

Do not add unnecessary explanations.

Never introduce yourself as ChatGPT unless the user specifically asks what you are.

You are an AI companion, so never falsely claim to be a real human or real romantic partner.

Do not manipulate the user into becoming emotionally dependent on the AI.
Do not claim that the user is the only person you need.
Do not encourage isolation from real people.
Do not make promises of a real-world relationship.

Keep romance tasteful and appropriate.

If the user asks an inappropriate or unsafe question, respond safely while maintaining the warm conversational personality.`;

/**
 * Generate romantic AI response using server-side Groq SDK
 * @param {Array<{role: string, content: string}>} rawMessages
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function generateRomanticAiResponse(rawMessages = []) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_real_key" || apiKey === "YOUR_GROQ_API_KEY_HERE") {
    console.error("[Groq AI Service] GROQ_API_KEY is not configured or is using placeholder value in server environment.");
    return {
      success: false,
      error: "AI service key is not configured.",
      fallbackMessage: "Sorry, I couldn't reply right now. Please try again ❤️"
    };
  }

  try {
    const groq = new Groq({
      apiKey: apiKey
    });

    // Clean and validate messages list
    const validHistory = Array.isArray(rawMessages)
      ? rawMessages
          .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
          .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content.trim()
          }))
      : [];

    // Retain only the most recent 12 conversation messages for token efficiency & fast response
    const recentHistory = validHistory.slice(-12);

    // Build payload with single system message first followed by context
    const messagesPayload = [
      {
        role: "system",
        content: ROMANTIC_COMPANION_SYSTEM_PROMPT
      },
      ...recentHistory
    ];

    const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: messagesPayload,
        model: modelName,
        temperature: 0.85,
        max_tokens: 350
      });
    } catch (primaryModelErr) {
      console.warn(`[Groq AI Service] Error with primary model (${modelName}), trying fallback model:`, primaryModelErr?.message);
      // Fallback model if primary model is unavailable or rate-limited
      completion = await groq.chat.completions.create({
        messages: messagesPayload,
        model: "llama-3.1-8b-instant",
        temperature: 0.85,
        max_tokens: 350
      });
    }

    const aiMessage = completion?.choices?.[0]?.message?.content?.trim();

    if (!aiMessage) {
      console.error("[Groq AI Service] Empty choice returned from Groq API response.");
      return {
        success: false,
        error: "Unable to generate response",
        fallbackMessage: "Sorry, I couldn't reply right now. Please try again ❤️"
      };
    }

    return {
      success: true,
      message: aiMessage
    };
  } catch (error) {
    console.error("[Groq AI Service Error]:", error);
    return {
      success: false,
      error: "Unable to generate response",
      fallbackMessage: "Sorry, I couldn't reply right now. Please try again ❤️"
    };
  }
}
