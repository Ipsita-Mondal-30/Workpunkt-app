import { Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useThemeColors } from "@/lib/theme/theme-context";
import { appAlert } from "@/lib/ui/app-alert";

import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  HorizontalDataTable,
  type DataColumn,
} from "@/components/shared/horizontal-data-table";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";

type EmailLogListItem = {
  id: string;
  createdAt: string;
  from: string;
  to: string[];
  subject: string;
  lastEvent: string;
};

type EmailLogsData = {
  emails: EmailLogListItem[];
  hasMore: boolean;
  nextCursor: string | null;
};

export default function AdminEmailLogsScreen() {
  const colors = useThemeColors();
  const [selected, setSelected] = useState<EmailLogListItem | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [lookupInfo, setLookupInfo] = useState<string | null>(null);

  const lookup = useApiMutation<
    { logEmail: string },
    {
      ok: boolean;
      currentEmail?: string | null;
      displayName?: string | null;
      sources?: string[];
      error?: string;
    }
  >("/api/admin/email-logs/bounce/lookup");

  const updateEmail = useApiMutation<
    { oldEmail: string; newEmail: string },
    { ok: boolean; message?: string; error?: string }
  >("/api/admin/email-logs/bounce/update", [
    queryKeys.adminEmailLogs(),
    queryKeys.scopes.admin(),
  ]);

  const resend = useApiMutation<
    { emailId: string; toEmail: string },
    { ok: boolean; message?: string; error?: string }
  >("/api/admin/email-logs/bounce/resend", [queryKeys.adminEmailLogs()]);

  const columns: DataColumn<EmailLogListItem>[] = [
    {
      key: "subject",
      title: "Subject",
      width: 200,
      render: (row) => (
        <Text className="text-sm font-semibold text-text" numberOfLines={2}>
          {row.subject || "(no subject)"}
        </Text>
      ),
    },
    {
      key: "to",
      title: "To",
      width: 180,
      render: (row) => (
        <Text className="text-sm text-muted" numberOfLines={2}>
          {row.to.join(", ")}
        </Text>
      ),
    },
    {
      key: "event",
      title: "Event",
      width: 110,
      render: (row) => (
        <Text className="text-sm font-semibold text-brand-mid">{row.lastEvent}</Text>
      ),
    },
    {
      key: "from",
      title: "From",
      width: 160,
      render: (row) => (
        <Text className="text-sm text-muted" numberOfLines={1}>
          {row.from}
        </Text>
      ),
    },
    {
      key: "created",
      title: "Created",
      width: 160,
      render: (row) => (
        <Text className="text-sm text-muted">
          {new Date(row.createdAt).toLocaleString()}
        </Text>
      ),
    },
  ];

  return (
    <>
      <ResourceScreen<EmailLogsData>
        title="Email Logs"
        subtitle="Delivery events and bounce recovery"
        queryKey={queryKeys.adminEmailLogs()}
        path="/api/admin/email-logs"
      >
        {(data) => (
          <HorizontalDataTable
            columns={columns}
            rows={data.emails}
            keyExtractor={(row) => row.id}
            onRowPress={(row) => {
              setSelected(row);
              setNewEmail(row.to[0] ?? "");
              setLookupInfo(null);
            }}
            emptyLabel="No email logs."
          />
        )}
      </ResourceScreen>

      <DetailSheet
        visible={Boolean(selected)}
        title={selected?.subject || "Email"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">To: {selected.to.join(", ")}</Text>
            <Text className="text-sm text-text">Event: {selected.lastEvent}</Text>
            <Text className="text-sm text-text">From: {selected.from}</Text>

            <Pressable
              className="rounded-xl border border-border bg-surface px-4 py-3"
              onPress={() =>
                lookup.mutate(
                  { logEmail: selected.to[0] ?? "" },
                  {
                    onSuccess: (result) => {
                      setLookupInfo(
                        [
                          result.displayName,
                          result.currentEmail,
                          result.sources?.join(", "),
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No recipient match.",
                      );
                      if (result.currentEmail) setNewEmail(result.currentEmail);
                    },
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-text">
                Lookup bounce recipient
              </Text>
            </Pressable>

            {lookupInfo ? <Text className="text-xs text-muted">{lookupInfo}</Text> : null}

            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Corrected email"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
              className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
            />

            <Pressable
              className="rounded-xl bg-brand-mid px-4 py-3"
              onPress={() =>
                updateEmail.mutate(
                  { oldEmail: selected.to[0] ?? "", newEmail },
                  {
                    onSuccess: (result) =>
                      appAlert("Updated", result.message ?? "Email updated."),
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-white">
                Update recipient email
              </Text>
            </Pressable>

            <Pressable
              className="rounded-xl border border-border bg-surface px-4 py-3"
              onPress={() =>
                resend.mutate(
                  { emailId: selected.id, toEmail: newEmail },
                  {
                    onSuccess: (result) =>
                      appAlert("Resent", result.message ?? "Email resent."),
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-text">Resend email</Text>
            </Pressable>
          </View>
        ) : null}
      </DetailSheet>
    </>
  );
}
