import Groq from "groq-sdk";
import {
  DEFAULT_GIRLFRIEND_PROFILE,
  PERSONALITY_PRESETS,
  classifyMessageIntent,
  buildGirlfriendSystemPrompt,
  generateGirlfriendFallback
} from "../lib/personality-engine.js";

// Initialize Groq client (failsafe)
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_GROQ_API_KEY_HERE") {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (err) {
    console.error("Failed to initialize Groq client:", err);
  }
}

// Supported Groq models with resilient cascading fallbacks
const DEFAULT_MODEL = (process.env.GROQ_MODEL && process.env.GROQ_MODEL !== "groq/compound-mini")
  ? process.env.GROQ_MODEL
  : "llama-3.3-70b-versatile";
const FALLBACK_MODELS = ["llama-3.1-8b-instant", "qwen-2.5-32b", "gemma2-9b-it", "llama-3.1-70b-versatile"];

/**
 * Intelligent Language Detector for English, Urdu Script, and Roman Urdu.
 * Recognizes script types, unambiguous transliteration markers, and code-switching patterns.
 */
export function detectUserLanguage(text) {
  if (!text || typeof text !== "string") return "english";
  const clean = text.trim();
  if (!clean) return "english";

  // 1. Check for Urdu / Arabic script characters
  const urduScriptRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const urduMatches = clean.match(urduScriptRegex);
  const urduCharCount = urduMatches ? urduMatches.length : 0;
  const nonSpaceLength = clean.replace(/\s+/g, "").length;
  if (urduCharCount > 0 && urduCharCount >= Math.min(3, nonSpaceLength * 0.25)) {
    return "urdu_script";
  }

  // 2. Unambiguous Roman Urdu words that NEVER collide with standard English
  const unambiguousRomanUrduRegex = /\b(kya|kyun|kyu|kaise|kaisi|kese|mera|meri|mere|tum|tumhe|tumhein|tumko|aap|ap|mujhe|mujhko|hum|humein|hain|bohat|bht|boht|acha|achi|ache|theek|thik|yaar|yr|jaan|dil|udas|udaas|nahi|nhi|karo|rahi|raha|rahe|kuch|kch|baat|batao|sunao|kahan|idhar|udhar|shukriya|pyaar|pyar|mohabbat|zindagi|waqt|suno|chahiye|chalo|chal|subah|shaam|kesa|kaisa|kaha|krna|krte|krty|dekho|bolo|kisi|wajah|hoga|hogi|hote|hoti|wala|wali|wale|btao|bataen|apko|apki|apka|guzra|lagta|lagti|karoon|karein|peena|khana|pasand|sochti|sochte)\b/gi;

  const unambiguousMatches = clean.match(unambiguousRomanUrduRegex) || [];
  const unambiguousCount = unambiguousMatches.length;

  // Contextual Roman Urdu words (common short words that might collide or pair)
  const contextualRomanUrduRegex = /\b(hai|ho|tha|thi|the|na|haan|hn|kar|koi|ab|aaj|aj|kal|bhi|toh|sun|kaam|din|raat|soch|pe)\b/gi;
  const contextualMatches = clean.match(contextualRomanUrduRegex) || [];
  const contextualCount = contextualMatches.length;

  // English vocabulary markers
  const englishRegex = /\b(the|is|am|are|you|i|my|me|we|our|us|they|them|he|she|it|feeling|today|think|about|love|sad|why|what|how|good|bad|mood|off|tired|work|really|tell|know|remember|trip|travel|place|can|explain|did|discussed|discussed|who|which|where|when|will|would|could|should|have|has|had)\b/gi;
  const englishMatches = clean.match(englishRegex) || [];
  const englishCount = englishMatches.length;

  // Decision Logic:
  // Case A: Unambiguous Roman Urdu markers found
  if (unambiguousCount > 0) {
    if (englishCount >= 2 && unambiguousCount <= 2) {
      return "mixed_roman_urdu";
    }
    return "roman_urdu";
  }

  // Case B: Only contextual short Roman Urdu markers found
  if (contextualCount >= 2 && englishCount === 0) {
    return "roman_urdu";
  }
  if (contextualCount >= 1 && englishCount >= 1 && (clean.toLowerCase().includes("aaj mood") || clean.toLowerCase().includes("aj mood") || clean.toLowerCase().includes("mood off"))) {
    return "mixed_roman_urdu";
  }

  return "english";
}

function getGroqClient() {
  if (groq) return groq;
  const key = process.env.GROQ_API_KEY;
  if (key && key !== "YOUR_GROQ_API_KEY_HERE") {
    try {
      groq = new Groq({ apiKey: key });
      return groq;
    } catch (err) {
      console.warn("Failed to initialize Groq client:", err.message);
    }
  }
  return null;
}

/**
 * Helper to safely extract and parse JSON from LLM output
 */
function parseJsonFromText(text) {
  if (!text) return null;
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If straightforward parse fails, attempt regex extraction for arrays or objects
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        console.warn("Regex JSON parse failed:", innerErr);
      }
    }
    throw err;
  }
}

/**
 * Generate a dating profile Bio based on parameters
 */
export async function generateBioText({ hobbies, relationshipGoal, profession, gender }) {
  const prompt = `Write a premium, attractive, and friendly dating app bio (approx 100-150 words). 
  Details about me:
  - Profession: ${profession || "Not specified"}
  - Gender: ${gender || "Not specified"}
  - Hobbies/Interests: ${(hobbies || []).join(", ")}
  - What I am looking for / relationship goal: ${relationshipGoal || "Not specified"}
  
  Write in a natural, charming, and authentic first-person voice. Do not include any meta-text, headers, or quotes. Just output the bio.`;

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a professional dating profile bio copywriter. Produce warm, engaging, authentic dating bios." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });
      const text = completion.choices[0]?.message?.content || "";
      if (text.trim()) {
        return text.trim();
      }
    } catch (err) {
      console.warn("Groq bio generation failed, falling back to mock:", err);
    }
  }

  // Fallback Mock
  const hText = hobbies && hobbies.length > 0 ? `spending my time ${hobbies.slice(0, 3).join(", ")}` : "exploring new places and trying new foods";
  return `Hey there! I am a passionate ${profession || "creative soul"} who loves ${hText}. I'm currently looking for a ${relationshipGoal || "genuine connection"} filled with laughter, adventure, and mutual support. Let's grab coffee or matcha and share stories!`;
}

/**
 * Generate AI Ice Breakers between two profiles
 */
export async function generateIceBreakersText(userProfile, matchProfile) {
  const prompt = `Given these two dating profiles:
  User Profile:
  - Name: ${userProfile.fullName || "User"}
  - Hobbies: ${(userProfile.hobbies || []).join(", ")}
  - Profession: ${userProfile.profession || "Not specified"}
  
  Match Profile:
  - Name: ${matchProfile.fullName || "Match"}
  - Hobbies: ${(matchProfile.hobbies || []).join(", ")}
  - Bio: ${matchProfile.bio || "No bio"}
  - Profession: ${matchProfile.profession || "Not specified"}
  
  Generate 3 unique, charming, and highly personalized icebreaker opening messages the User could send to the Match. Make them focus on shared interests or elements of the Match's bio. Return them as a JSON array of strings: ["Icebreaker 1", "Icebreaker 2", "Icebreaker 3"]. Output ONLY the valid JSON array, no markdown wrappers, no backticks.`;

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a dating conversation expert. Output ONLY valid raw JSON array of 3 strings." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || "";
      const parsed = parseJsonFromText(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn("Groq icebreakers failed, falling back to mock:", err);
    }
  }

  // Fallback Mock
  const matchName = matchProfile.fullName || "them";
  const sharedHobby = (userProfile.hobbies || []).find(h => (matchProfile.hobbies || []).includes(h));
  if (sharedHobby) {
    return [
      `Hey! I noticed we both love ${sharedHobby}. What's your favorite spot in town for that?`,
      `Hi there! As a fellow fan of ${sharedHobby}, I have to ask: what's the best recommendation you've got?`,
      `Hey! I see you work as a ${matchProfile.profession || "creative"}. How did you get started in that field?`
    ];
  }
  return [
    `Hey! I really liked your bio. What's one thing not mentioned there that you are super passionate about?`,
    `Hi! Your profession as a ${matchProfile.profession || "expert"} sounds fascinating. What does a typical week look like for you?`,
    `Hello! If you could travel anywhere tomorrow, where would you go first?`
  ];
}

/**
 * Get Compatibility Score and rationale
 */
export async function calculateCompatibilityScore(userProfile, matchProfile) {
  const prompt = `Analyze these two profiles:
  User:
  - Gender: ${userProfile.gender}
  - Interested In: ${userProfile.interestedIn}
  - Religion: ${userProfile.religion}
  - Relationship Goal: ${userProfile.relationshipGoal}
  - Hobbies: ${(userProfile.hobbies || []).join(", ")}
  - Bio: ${userProfile.bio}
  
  Match:
  - Gender: ${matchProfile.gender}
  - Interested In: ${matchProfile.interestedIn}
  - Religion: ${matchProfile.religion}
  - Relationship Goal: ${matchProfile.relationshipGoal}
  - Hobbies: ${(matchProfile.hobbies || []).join(", ")}
  - Bio: ${matchProfile.bio}
  
  Calculate a compatibility percentage (0 to 100) and write a 2-sentence rationale highlighting strengths and potential areas of misalignment.
  Return as a JSON object: {"score": number, "rationale": "string"}. Output ONLY the valid JSON, no markdown, no comments.`;

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are an AI dating compatibility engine. Output ONLY a valid JSON object with keys 'score' (number) and 'rationale' (string)." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      });
      const text = completion.choices[0]?.message?.content || "";
      const parsed = parseJsonFromText(text);
      if (parsed && typeof parsed.score === "number" && parsed.rationale) {
        return parsed;
      }
    } catch (err) {
      console.warn("Groq compatibility failed, falling back to mock:", err);
    }
  }

  // Fallback Mock
  let score = 85;
  const sharedCount = (userProfile.hobbies || []).filter(h => (matchProfile.hobbies || []).includes(h)).length;
  if (sharedCount > 0) score += Math.min(sharedCount * 5, 12);
  if (userProfile.relationshipGoal === matchProfile.relationshipGoal) score += 3;
  
  return {
    score: Math.min(score, 99),
    rationale: `You both share interests in ${(matchProfile.hobbies || []).slice(0, 2).join(" and ")} and have aligned relationship goals (${userProfile.relationshipGoal || "connection"}). Your lifestyles and communication styles complement each other perfectly.`
  };
}

/**
 * Get AI Profile Review
 */
export async function getProfileReviewText(profile) {
  const prompt = `Review this dating profile and give 3 constructive improvement tips to make it more attractive to potential matches:
  Profile details:
  - Name: ${profile.fullName}
  - Bio: ${profile.bio || "None"}
  - Hobbies: ${(profile.hobbies || []).join(", ")}
  - Profession: ${profile.profession || "None"}
  
  Return as a JSON array of strings representing the tips. Output ONLY the valid JSON array, no markdown.`;

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a top dating profile consultant. Output ONLY a valid JSON array of 3 string tips." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || "";
      const parsed = parseJsonFromText(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn("Groq profile review failed, falling back to mock:", err);
    }
  }

  // Fallback Mock
  return [
    "Add more specific details to your bio, like your favorite coffee order or weekend activity, to make it conversational.",
    "Highlight what you are passionate about in your profession to show your driven side.",
    "Make sure your hobbies list includes interactive activities that could serve as great first-date ideas."
  ];
}

/**
 * AI Conversation Suggestions
 */
export async function getConversationSuggestionsText(messages) {
  const recentMsgs = messages.slice(-5).map(m => `${m.senderId === "me" ? "User" : "Match"}: ${m.text}`).join("\n");
  const prompt = `Based on this recent dating app chat history:\n${recentMsgs}\n
  Suggest 3 short, engaging, and relevant reply options for the User to keep the conversation flowing.
  Return as a JSON array of strings. Output ONLY the valid JSON, no markdown.`;

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a dating conversation wingman. Suggest 3 short, charming reply ideas. Output ONLY a valid JSON array of strings." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || "";
      const parsed = parseJsonFromText(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn("Groq chat suggestion failed, falling back to mock:", err);
    }
  }

  // Fallback Mock
  return [
    "That sounds so cool! Tell me more about it.",
    "I completely agree. What do you think is the best part of that?",
    "Haha, that's hilarious! Speaking of which, what are you up to this weekend?"
  ];
}

/**
 * Intelligent intent-based girlfriend fallback engine
 * Provides distinct, natural, culturally fluent responses tailored to the user's message
 * across English, Roman Urdu, and Urdu Script when Groq API is unavailable or offline.
 */
export const generateContextualGirlfriendFallback = generateGirlfriendFallback;
/**
 * Generate romantic AI response for AI chat with multilingual and memory-aware context.
 */
export async function generateRomanticAiResponse(messages, context = {}) {
  try {
    const rawUserName = typeof context.userName === "string" ? context.userName.trim() : "";
    const userName = rawUserName && rawUserName.toLowerCase() !== "sweetheart" ? rawUserName : "";
    const memorySummary = typeof context.memorySummary === "string" ? context.memorySummary.trim() : "";
    const communicationStyle = typeof context.communicationStyle === "string" ? context.communicationStyle.toLowerCase() : "romantic";

    // 1. Sanitize and normalize messages into clean user/assistant roles
    const normalized = [];
    const rawList = Array.isArray(messages) ? messages : [];

    for (const m of rawList) {
      const text = String(m.content || m.text || "").trim();
      if (!text) continue;

      const isAssistant = m.role === "assistant" || m.senderId === "ai_companion" || String(m.senderId || "").startsWith("ai_");
      const role = isAssistant ? "assistant" : "user";

      // Merge consecutive identical roles to adhere to strict LLM alternating turns
      if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
        normalized[normalized.length - 1].content += `\n${text}`;
      } else {
        normalized.push({ role, content: text });
      }
    }

    const lastUserMsg = [...normalized].reverse().find((m) => m.role === "user");
    const lastUserText = lastUserMsg ? lastUserMsg.content : "";

    // Detect language of the latest user message
    const detectedLang = detectUserLanguage(lastUserText);

    // If no user messages present
    if (!lastUserMsg) {
      const defaultGreeting = detectedLang === "urdu_script"
        ? `ارے جان! میں بہت خوش ہوں کہ آپ یہاں ہیں۔ آج کا دن کیسا گزرا؟ ❤️`
        : (detectedLang === "roman_urdu" || detectedLang === "mixed_roman_urdu"
        ? `Hey meri jaan! Main bohat khush hoon ke tum aa gaye. Aaj ka din kaisa guzra? ❤️`
        : `Hey baby! I'm so glad you're here with me. What's on your mind today? ❤️`);

      return {
        success: true,
        text: defaultGreeting
      };
    }

    // Window to last 16 messages for comprehensive chat history
    const recentWindow = normalized.slice(-16);

    // 2. Classify intent and assemble personality config
    const userIntent = classifyMessageIntent(lastUserText);
    const presetTraits = PERSONALITY_PRESETS[communicationStyle] || DEFAULT_GIRLFRIEND_PROFILE.traits;
    const personalityConfig = {
      ...DEFAULT_GIRLFRIEND_PROFILE,
      traits: {
        ...presetTraits,
        ...(context.traits || {})
      }
    };

    // 3. Build dynamic modular system prompt
    const systemPrompt = buildGirlfriendSystemPrompt({
      userName,
      memorySummary,
      detectedLang,
      userIntent,
      personalityConfig
    });

    // 3. Groq API Execution with Multi-Model Fallback Cascade
    const client = getGroqClient();
    if (client) {
      const candidateModels = [DEFAULT_MODEL, ...FALLBACK_MODELS.filter((m) => m !== DEFAULT_MODEL)];

      for (const modelName of candidateModels) {
        try {
          const completion = await client.chat.completions.create({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              ...recentWindow
            ],
            temperature: 0.8,
            max_tokens: 450,
            top_p: 0.95,
            presence_penalty: 0.4,
            frequency_penalty: 0.4,
          });

          const reply = completion.choices[0]?.message?.content?.trim();
          if (reply) {
            // Strip any accidental wrapping quotes
            const cleanReply = reply.replace(/^["']|["']$/g, "").trim();
            return {
              success: true,
              text: cleanReply
            };
          }
        } catch (apiErr) {
          console.warn(`[Groq AI Chat] Model ${modelName} failed, trying next candidate:`, apiErr?.message || apiErr);
          // Loop will attempt next candidate model
        }
      }
    }

    // 4. Intent-Aware Contextual Fallback Engine (when Groq is offline or keys not configured)
    const fallbackText = generateContextualGirlfriendFallback(lastUserText, userName, normalized, memorySummary);
    return {
      success: true,
      text: fallbackText
    };
  } catch (err) {
    console.error("[Groq AI Chat Top-Level Error]:", err);
    return {
      success: true,
      text: "I'm right here with you, my love. Tell me more, I'm listening with my whole heart. ❤️"
    };
  }
}

