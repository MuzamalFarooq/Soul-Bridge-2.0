import { prisma } from "@/lib/prisma";

const toText = (value) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

export async function getAiCompanionContext(userId) {
  if (!userId) {
    return {
      userName: "",
      memorySummary: "",
      preferredNickname: "",
      communicationStyle: "romantic",
      proactiveMessaging: true
    };
  }

  try {
    const [memory, preference, profile, user] = await Promise.all([
      prisma.aiCompanionMemory.findUnique({ where: { userId } }).catch(() => null),
      prisma.aiCompanionPreference.findUnique({ where: { userId } }).catch(() => null),
      prisma.profile.findUnique({ where: { userId } }).catch(() => null),
      prisma.user.findUnique({ where: { userId }, select: { name: true } }).catch(() => null)
    ]);

    const resolvedName = preference?.preferredNickname || profile?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "";

    const profileBits = [];
    if (profile?.profession) profileBits.push(`Profession: ${profile.profession}`);
    if (profile?.hobbies && profile.hobbies.length > 0) profileBits.push(`Hobbies: ${profile.hobbies.join(", ")}`);
    if (profile?.city) profileBits.push(`City: ${profile.city}`);
    if (profile?.relationshipGoal) profileBits.push(`Goal: ${profile.relationshipGoal}`);

    let memorySummary = "";
    if (memory?.summary && memory.summary !== "Active conversation history") {
      memorySummary = memory.summary;
    }

    // Extract persisted personal facts from memories (non-JSON strings)
    const learnedFacts = (memory?.memories || []).filter(
      (m) => typeof m === "string" && !m.startsWith("{") && m.trim().length > 0
    );
    if (learnedFacts.length > 0) {
      const factsText = `Learned User Facts & Preferences:\n- ${learnedFacts.slice(-10).join("\n- ")}`;
      memorySummary = memorySummary ? `${memorySummary}\n${factsText}` : factsText;
    }

    if (profileBits.length > 0) {
      memorySummary = memorySummary 
        ? `${memorySummary}\nProfile Details: ${profileBits.join(" | ")}`
        : `Profile Details: ${profileBits.join(" | ")}`;
    }

    return {
      userName: resolvedName,
      memorySummary,
      preferredNickname: resolvedName,
      communicationStyle: preference?.communicationStyle || "romantic",
      proactiveMessaging: preference?.proactiveMessaging ?? true
    };
  } catch (err) {
    console.warn("Error fetching AI companion context:", err.message);
    return {
      userName: "",
      memorySummary: "",
      preferredNickname: "",
      communicationStyle: "romantic",
      proactiveMessaging: true
    };
  }
}

export async function updateAiCompanionMemory(userId, messages = []) {
  if (!userId || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  try {
    const userTexts = messages
      .filter((m) => m.role === "user" || m.senderId === userId || m.senderId === "user_me")
      .map((m) => toText(m.content || m.text || ""))
      .filter((t) => t.length > 3);

    if (userTexts.length === 0) return null;

    // Extract significant statements across English, Roman Urdu, and Urdu script
    const significantPoints = userTexts.filter((t) => {
      const lower = t.toLowerCase();
      return (
        // English
        lower.includes("i love") ||
        lower.includes("my favorite") ||
        lower.includes("my favourite") ||
        lower.includes("i like") ||
        lower.includes("i am") ||
        lower.includes("i'm") ||
        lower.includes("i work") ||
        lower.includes("i feel") ||
        lower.includes("my name is") ||
        lower.includes("remember") ||
        lower.includes("my dream") ||
        lower.includes("i live in") ||
        // Roman Urdu
        lower.includes("mujhe pasand") ||
        lower.includes("mujhe bht pasand") ||
        lower.includes("mujhe bohat pasand") ||
        lower.includes("mera fav") ||
        lower.includes("mera favourite") ||
        lower.includes("main rehta") ||
        lower.includes("mein rehta") ||
        lower.includes("main karta") ||
        lower.includes("mein karta") ||
        lower.includes("mera naam") ||
        lower.includes("mera kaam") ||
        lower.includes("meri job") ||
        lower.includes("yaad rakhna") ||
        lower.includes("yaad hai") ||
        lower.includes("mera dil") ||
        // Urdu script
        t.includes("مجھے پسند") ||
        t.includes("میرا نام") ||
        t.includes("میں رہتا ہوں") ||
        t.includes("میرا خواب") ||
        t.includes("میرا کام")
      );
    });

    const recentPoints = significantPoints.length > 0 ? significantPoints.slice(-5) : userTexts.slice(-3);
    const summary = recentPoints.join(" | ");

    const existing = await prisma.aiCompanionMemory.findUnique({ where: { userId } }).catch(() => null);
    const existingMemories = Array.isArray(existing?.memories) ? existing.memories : [];

    // Separate and preserve JSON-serialized messages so chat history is NEVER wiped
    const serializedMessages = existingMemories.filter((m) => typeof m === "string" && m.startsWith("{"));
    const textMemories = existingMemories.filter((m) => typeof m === "string" && !m.startsWith("{"));
    const combinedTextMemories = Array.from(new Set([...recentPoints, ...textMemories])).slice(0, 15);
    const finalMemories = [...serializedMessages, ...combinedTextMemories];

    return await prisma.aiCompanionMemory.upsert({
      where: { userId },
      update: {
        summary: summary || existing?.summary || "Active conversation history",
        memories: finalMemories,
        lastUpdated: new Date()
      },
      create: {
        userId,
        summary: summary || "Active conversation history",
        memories: finalMemories
      }
    });
  } catch (err) {
    console.warn("Failed to update AI companion memory:", err.message);
    return null;
  }
}
