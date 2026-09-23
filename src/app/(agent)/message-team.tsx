import { Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";
import { dateLabel } from "@/lib/student/presentation";
import { useThemeColors } from "@/lib/theme/theme-context";
import { appAlert } from "@/lib/ui/app-alert";

type SupportMessage = {
  id: string;
  senderRole: string;
  senderName: string;
  body: string;
  createdAt: string;
};

type SupportInboxData = {
  threadId: string | null;
  thread: {
    id: string;
    subject: string;
    status: string;
    lastMessageAt: string;
  } | null;
  messages: SupportMessage[];
};

export default function AgentMessageTeamScreen() {
  const colors = useThemeColors();
  const [message, setMessage] = useState("");

  const sendMutation = useApiMutation<
    { kind: "agent_chat"; message: string },
    { ok?: boolean; error?: string }
  >("/api/support/inbox", [queryKeys.supportInbox()]);

  return (
    <ResourceScreen<SupportInboxData>
      title="Message Team"
      subtitle="Chat with the Workpunkt partner support team"
      queryKey={queryKeys.supportInbox()}
      path="/api/support/inbox"
      staleTime={30_000}
    >
      {(data, { refetch }) => (
        <>
          {data.thread ? (
            <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3">
              <Text className="text-sm font-semibold text-text">{data.thread.subject}</Text>
              <Text className="mt-1 text-xs uppercase text-brand-mid">
                {data.thread.status}
              </Text>
            </View>
          ) : null}

          <View className="mb-4 gap-2">
            {data.messages.length === 0 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">
                  No messages yet. Send a note to the team below.
                </Text>
              </View>
            ) : (
              data.messages.map((item) => (
                <View
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <Text className="text-xs font-semibold text-brand-mid">
                    {item.senderName} · {item.senderRole}
                  </Text>
                  <Text className="mt-1 text-sm text-text">{item.body}</Text>
                  <Text className="mt-2 text-[11px] text-muted">{dateLabel(item.createdAt)}</Text>
                </View>
              ))
            )}
          </View>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write a message to the team…"
            placeholderTextColor={colors.placeholder}
            multiline
            className="min-h-[96px] rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
          />

          <Pressable
            className="mt-3 rounded-xl bg-brand-mid px-4 py-3"
            disabled={sendMutation.isPending || !message.trim()}
            onPress={() =>
              sendMutation.mutate(
                { kind: "agent_chat", message: message.trim() },
                {
                  onSuccess: () => {
                    setMessage("");
                    refetch();
                    appAlert("Sent", "Your message was sent to the team.");
                  },
                  onError: (error) => appAlert("Error", error.message),
                },
              )
            }
          >
            <Text className="text-center text-sm font-semibold text-white">
              {sendMutation.isPending ? "Sending…" : "Send message"}
            </Text>
          </Pressable>
        </>
      )}
    </ResourceScreen>
  );
}
