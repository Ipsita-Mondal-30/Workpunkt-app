import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";
import { dateLabel } from "@/lib/student/presentation";

type SupportMessage = { id: string; senderRole: string; senderName: string; body: string; createdAt: string };
type SupportInbox = { threadId: string | null; thread: { id: string; subject: string; status: string } | null; messages: SupportMessage[] };

export default function StudentSupportScreen() {
  const [message, setMessage] = useState("");
  const send = useApiMutation<{ kind: "student_help"; message: string }, unknown>("/api/support/inbox", [queryKeys.supportInbox()]);
  return (
    <ResourceScreen<SupportInbox>
      title="Help & Counsellor"
      subtitle="Klara is available 24/7. Your counsellor replies here during working hours."
      queryKey={queryKeys.supportInbox()}
      path="/api/support/inbox"
      staleTime={20_000}
    >
      {(data, { refetch }) => (
        <View>
          {data.thread ? <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3"><Text className="text-sm font-bold text-text">{data.thread.subject}</Text><Text className="mt-1 text-[11px] font-bold uppercase text-brand-mid">{data.thread.status}</Text></View> : null}
          <View className="gap-2">
            {data.messages.length === 0 ? <View className="rounded-2xl border border-border bg-surface px-4 py-6"><Text className="text-sm text-muted">No messages yet. Tell us how we can help.</Text></View> : data.messages.map((item) => (
              <View key={item.id} className={item.senderRole === "student" ? "ml-8 rounded-2xl bg-brand-mid px-4 py-3" : "mr-8 rounded-2xl border border-border bg-surface px-4 py-3"}>
                <Text className={item.senderRole === "student" ? "text-[11px] font-bold text-white/80" : "text-[11px] font-bold text-brand-mid"}>{item.senderName || item.senderRole}</Text>
                <Text className={item.senderRole === "student" ? "mt-1 text-sm text-white" : "mt-1 text-sm text-text"}>{item.body}</Text>
                <Text className={item.senderRole === "student" ? "mt-1 text-[10px] text-white/70" : "mt-1 text-[10px] text-muted"}>{dateLabel(item.createdAt)}</Text>
              </View>
            ))}
          </View>
          <TextInput value={message} onChangeText={setMessage} placeholder="Message your counsellor…" placeholderTextColor="#71717a" multiline className="mt-5 min-h-[100px] rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text" />
          <Pressable disabled={send.isPending || !message.trim()} onPress={() => send.mutate({ kind: "student_help", message: message.trim() }, { onSuccess: () => { setMessage(""); refetch(); }, onError: (error) => Alert.alert("Could not send", error.message) })} className="mt-3 rounded-xl bg-brand-mid px-4 py-3">
            <Text className="text-center text-sm font-bold text-white">{send.isPending ? "Sending…" : "Send message"}</Text>
          </Pressable>
        </View>
      )}
    </ResourceScreen>
  );
}
