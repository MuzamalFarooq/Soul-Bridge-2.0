import Groq from "groq-sdk";

// Initialize Groq client (failsafe)
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_GROQ_API_KEY_HERE") {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (err) {
    console.error("Failed to initialize Groq client:", err);
  }
}

const DEFAULT_MODEL = process.env.GROQ_MODEL || "groq/compound-mini";

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
