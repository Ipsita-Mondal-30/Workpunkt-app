import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

import { GradientButton } from "@/components/shared/gradient-button";
import { KlaraAvatar } from "@/components/shared/klara-avatar";
import { authFetch } from "@/lib/api/auth-fetch";
import { AI_CHAT_WELCOME_MESSAGE } from "@/lib/klara/faq-presets";
import { useThemeColors } from "@/lib/theme/theme-context";
import { createUuid } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function KlaraChatScreen({ subtitle }: { subtitle?: string }) {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: AI_CHAT_WELCOME_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = {
      id: createUuid(),
      role: "user",
      content: text,
    };
    const history = [...messages, userMessage]
      .filter((m) => m.id !== "welcome")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    console.log("[klara] send", { length: text.length });

    try {
      const response = await authFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1),
        }),
      });
      const json = (await response.json()) as {
        data?: { reply?: string };
        error?: string;
      };

      const reply =
        json.data?.reply ??
        json.error ??
        "Sorry, I couldn't respond right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
      console.log("[klara] reply ok", { status: response.status });
    } catch (error) {
      console.error("[klara] send failed", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong reaching Klara. Check your connection and try again.",
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      {subtitle ? (
        <Text className="border-b border-border px-4 py-2 text-sm text-muted">
          {subtitle}
        </Text>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 px-4 py-4"
        renderItem={({ item }) => (
          <View
            className={
              item.role === "user"
                ? "ml-10 self-end"
                : "mr-6 flex-row items-end gap-2 self-start"
            }
          >
            {item.role !== "user" ? <KlaraAvatar size={28} alt="" /> : null}
            <View
              className={
                item.role === "user"
                  ? "rounded-2xl bg-brand-mid px-4 py-3"
                  : "rounded-2xl border border-border bg-surface px-4 py-3"
              }
            >
              <Text
                className={
                  item.role === "user" ? "text-sm text-white" : "text-sm text-text"
                }
              >
                {item.content}
              </Text>
            </View>
          </View>
        )}
      />

      <View className="border-t border-border px-4 py-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Klara…"
          placeholderTextColor={colors.placeholder}
          multiline
          className="mb-3 max-h-28 rounded-2xl border border-border px-4 py-3 text-base text-text"
          style={{
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            color: colors.text,
          }}
        />
        <GradientButton
          text={sending ? "Sending…" : "Send"}
          loading={sending}
          onPress={() => void send()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
