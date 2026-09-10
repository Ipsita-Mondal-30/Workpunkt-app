import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { CounsellorScroll, SectionCard } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { authFetch } from "@/lib/api/auth-fetch";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function SupportScreen() {
  const { refreshing, refresh } = useCounsellorContext();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const inboxQuery = useQuery({
    queryKey: ["counsellor", "support"],
    queryFn: async () => {
      const response = await authFetch("/api/support/inbox");
      const json = (await response.json()) as {
        data?: {
          messages?: Array<{
            id: string;
            body?: string;
            message?: string;
            senderRole?: string;
            createdAt?: string;
            created_at?: string;
          }>;
        };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load inbox.");
      }
      return json.data?.messages ?? [];
    },
  });

  async function sendMessage() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const response = await authFetch("/api/support/inbox", {
        method: "POST",
        body: JSON.stringify({
          kind: "agent_chat",
          message: message.trim(),
          subject: "School counsellor support",
        }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not send message.");
      }
      setMessage("");
      await inboxQuery.refetch();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not send message.",
      );
    } finally {
      setSending(false);
    }
  }

  const messages = inboxQuery.data ?? [];

  return (
    <CounsellorScreenShell title="Message team" subtitle="Partner support inbox">
      <CounsellorScroll
        loading={inboxQuery.isLoading}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        error={inboxQuery.error instanceof Error ? inboxQuery.error.message : null}
      >
        <SectionCard title="Conversation">
          {messages.length === 0 ? (
            <Text className="mt-2 text-sm text-muted">No messages yet. Say hello below.</Text>
          ) : (
            messages.map((item) => (
              <View
                key={item.id}
                className="mb-3 rounded-2xl border border-border bg-bg px-4 py-3"
              >
                <Text className="text-xs font-semibold uppercase text-muted">
                  {item.senderRole ?? "support"}
                </Text>
                <Text className="mt-1 text-sm text-text">
                  {item.body ?? item.message ?? ""}
                </Text>
                <Text className="mt-1 text-xs text-muted">
                  {item.createdAt ?? item.created_at ?? ""}
                </Text>
              </View>
            ))
          )}
        </SectionCard>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Write a message"
          placeholderTextColor="#94a3b8"
          multiline
          className="min-h-[100px] rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text"
        />
        <View className="mt-4">
          <GradientButton text="Send" loading={sending} onPress={() => void sendMessage()} />
        </View>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
