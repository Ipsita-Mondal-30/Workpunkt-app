import AsyncStorage from "@react-native-async-storage/async-storage";

import { createUuid } from "@/lib/utils";

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
};

export type AiChatSession = {
  messages: AiChatMessage[];
  expiresAt: string;
};

const ANON_SESSION_ID_KEY = "workpunkt:ai-chat:anon-session-id";
const CONVERSATION_ID_KEY = "workpunkt:ai-chat:conversation-id";
const HISTORY_TTL_DAYS = 7;

function scopedStorageSuffix(userId?: string | null, scope?: string | null): string {
  const userPart = userId?.trim() || "anon";
  const scopePart = scope?.trim() || null;
  return scopePart ? `${userPart}::${scopePart}` : userPart;
}

function storageKey(userId?: string | null, scope?: string | null): string {
  const suffix = scopedStorageSuffix(userId, scope);
  if (userId?.trim()) {
    return `workpunkt:ai-chat:user:${suffix}`;
  }
  return `workpunkt:ai-chat:anon:${suffix}`;
}

function createExpiry(): string {
  return new Date(Date.now() + HISTORY_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function createAiChatMessage(
  role: AiChatMessage["role"],
  content: string,
  extras?: Partial<Pick<AiChatMessage, "isStreaming" | "id">>,
): AiChatMessage {
  return {
    id: extras?.id ?? createUuid(),
    role,
    content,
    createdAt: new Date().toISOString(),
    isStreaming: extras?.isStreaming,
  };
}

export async function getOrCreateConversationId(
  userId?: string | null,
  scope?: string | null,
): Promise<string> {
  const scopedKey = `${CONVERSATION_ID_KEY}:${scopedStorageSuffix(userId, scope)}`;
  try {
    const existing = await AsyncStorage.getItem(scopedKey);
    if (existing) return existing;
    const created = createUuid();
    await AsyncStorage.setItem(scopedKey, created);
    return created;
  } catch {
    return userId ? `user:${userId}` : createUuid();
  }
}

export async function loadAiChatSession(
  userId?: string | null,
  scope?: string | null,
): Promise<AiChatMessage[]> {
  try {
    let key = storageKey(userId, scope);
    if (!userId?.trim()) {
      let anonId = await AsyncStorage.getItem(ANON_SESSION_ID_KEY);
      if (!anonId) {
        anonId = createUuid();
        await AsyncStorage.setItem(ANON_SESSION_ID_KEY, anonId);
      }
      const scopePart = scope?.trim();
      key = scopePart
        ? `workpunkt:ai-chat:anon:${anonId}::${scopePart}`
        : `workpunkt:ai-chat:anon:${anonId}`;
    }

    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AiChatSession;
    if (!parsed?.expiresAt || Date.parse(parsed.expiresAt) <= Date.now()) {
      await AsyncStorage.removeItem(key);
      return [];
    }
    return (parsed.messages ?? []).filter((m) => !m.isStreaming);
  } catch {
    return [];
  }
}

export async function saveAiChatSession(
  messages: AiChatMessage[],
  userId?: string | null,
  scope?: string | null,
): Promise<void> {
  try {
    let key = storageKey(userId, scope);
    if (!userId?.trim()) {
      let anonId = await AsyncStorage.getItem(ANON_SESSION_ID_KEY);
      if (!anonId) {
        anonId = createUuid();
        await AsyncStorage.setItem(ANON_SESSION_ID_KEY, anonId);
      }
      const scopePart = scope?.trim();
      key = scopePart
        ? `workpunkt:ai-chat:anon:${anonId}::${scopePart}`
        : `workpunkt:ai-chat:anon:${anonId}`;
    }

    const persistable = messages
      .filter((m) => !m.isStreaming)
      .map(({ isStreaming: _ignored, ...rest }) => rest);

    const session: AiChatSession = {
      messages: persistable,
      expiresAt: createExpiry(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(session));
  } catch {
    // ignore storage failures
  }
}
