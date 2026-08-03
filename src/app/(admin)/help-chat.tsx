import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { DetailSheet } from "@/components/shared/detail-sheet";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";

type HelpChatMessage = {
  id: string;
  senderRole: string;
  senderName: string;
  body: string;
  createdAt: string;
};

type HelpChatThread = {
  id: string;
  kind: string;
  status: string;
  subject: string;
  requesterName: string;
  requesterEmail: string | null;
  unreadForAdmin: boolean;
  lastMessagePreview: string;
  lastMessageAt: string;
  messages: HelpChatMessage[];
};

type HelpChatData = {
  stats: Array<{
    id: string;
    value: string;
    label: string;
    color?: "purple" | "pink" | "blue" | "green";
  }>;
  threads: HelpChatThread[];
};

export default function AdminHelpChatScreen() {
  const [selected, setSelected] = useState<HelpChatThread | null>(null);
  const [reply, setReply] = useState("");

  const replyMutation = useApiMutation<
    { threadId: string; message: string },
    { ok: boolean; error?: string }
  >("/api/admin/support/inbox/reply", [queryKeys.supportInboxAdmin()]);

  const readMutation = useApiMutation<
    { threadId?: string; all?: boolean },
    { ok: boolean }
  >("/api/admin/support/inbox/read", [queryKeys.supportInboxAdmin()]);

  const statusMutation = useApiMutation<
    { threadId: string; status: string },
    { ok: boolean }
  >("/api/admin/support/inbox/status", [queryKeys.supportInboxAdmin()]);

  return (
    <>
      <ResourceScreen<HelpChatData>
        title="Help & Chat"
        subtitle="Support inbox for students and agents"
        queryKey={queryKeys.supportInboxAdmin()}
        path="/api/admin/support/inbox"
        staleTime={30_000}
        headerRight={
          <Pressable
            onPress={() =>
              readMutation.mutate(
                { all: true },
                { onError: (error) => Alert.alert("Error", error.message) },
              )
            }
            className="rounded-xl bg-surface-end px-3 py-2"
          >
            <Text className="text-xs font-semibold text-text">Mark all read</Text>
          </Pressable>
        }
      >
        {(data) => (
          <>
            <StatsRow
              stats={data.stats.map((s) => ({
                id: s.id,
                value: s.value,
                label: s.label,
                color: "purple",
              }))}
            />
            <View className="gap-2">
              {data.threads.length === 0 ? (
                <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                  <Text className="text-sm text-muted">No threads yet.</Text>
                </View>
              ) : (
                data.threads.map((thread) => (
                  <Pressable
                    key={thread.id}
                    onPress={() => {
                      setSelected(thread);
                      setReply("");
                      if (thread.unreadForAdmin) {
                        readMutation.mutate({ threadId: thread.id });
                      }
                    }}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="flex-1 text-sm font-semibold text-text">
                        {thread.requesterName}
                      </Text>
                      {thread.unreadForAdmin ? (
                        <View className="rounded-full bg-brand-mid px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-white">NEW</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-1 text-xs text-muted" numberOfLines={2}>
                      {thread.lastMessagePreview || thread.subject}
                    </Text>
                    <Text className="mt-2 text-[11px] uppercase text-brand-mid">
                      {thread.status} · {thread.kind}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}
      </ResourceScreen>

      <DetailSheet
        visible={Boolean(selected)}
        title={selected?.requesterName ?? "Thread"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <View className="gap-3">
            <Text className="text-xs text-muted">{selected.requesterEmail}</Text>
            <View className="max-h-72 gap-2">
              {selected.messages.map((message) => (
                <View
                  key={message.id}
                  className="rounded-xl border border-border bg-surface-end px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-brand-mid">
                    {message.senderName} · {message.senderRole}
                  </Text>
                  <Text className="mt-1 text-sm text-text">{message.body}</Text>
                </View>
              ))}
            </View>

            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder="Write a reply…"
              placeholderTextColor="#71717a"
              multiline
              className="min-h-[80px] rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
            />
            <Pressable
              className="rounded-xl bg-brand-mid px-4 py-3"
              disabled={replyMutation.isPending}
              onPress={() =>
                replyMutation.mutate(
                  { threadId: selected.id, message: reply },
                  {
                    onSuccess: () => {
                      setReply("");
                      Alert.alert("Sent", "Reply sent.");
                      setSelected(null);
                    },
                    onError: (error) => Alert.alert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-white">
                {replyMutation.isPending ? "Sending…" : "Send reply"}
              </Text>
            </Pressable>

            <View className="flex-row flex-wrap gap-2">
              {(["open", "waiting_on_user", "resolved"] as const).map((status) => (
                <Pressable
                  key={status}
                  className="rounded-lg border border-border bg-surface px-3 py-2"
                  onPress={() =>
                    statusMutation.mutate(
                      { threadId: selected.id, status },
                      {
                        onSuccess: () => Alert.alert("Updated", `Status → ${status}`),
                        onError: (error) => Alert.alert("Error", error.message),
                      },
                    )
                  }
                >
                  <Text className="text-xs font-semibold text-text">{status}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </DetailSheet>
    </>
  );
}
