import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";
import { postApiJson } from "@/lib/query/use-api";
import { asRecords, textValue, type UnknownRecord } from "@/lib/student/presentation";
import { cn } from "@/lib/utils";
import { appAlert } from "@/lib/ui/app-alert";

function programName(item: UnknownRecord) {
  return textValue(item, "degreeName", "programName", "program", "name", "title") || "Matched program";
}

function universityName(item: UnknownRecord) {
  return textValue(item, "universityName", "university", "institution");
}

export default function StudentMatchesScreen() {
  const [pendingDecision, setPendingDecision] = useState<string | null>(null);

  return (
    <ResourceScreen<unknown>
      title="My University Options"
      subtitle="Confirm the programs you want to proceed with, or reject those you do not."
      queryKey={queryKeys.matches()}
      path="/api/matches"
    >
      {(data, { refetch }) => {
        const items = asRecords(data);
        if (items.length === 0) {
          return (
            <View className="gap-4">
              <View className="rounded-3xl border border-brand-mid/20 bg-brand-start/10 px-5 py-6">
                <Text className="text-xs font-bold uppercase tracking-wider text-brand-mid">Matching in progress</Text>
                <Text className="mt-2 text-xl font-bold text-text">Sit back — we're finding your best matches</Text>
                <Text className="mt-2 text-sm leading-5 text-muted">
                  Your counsellor is reviewing your profile. Reach, Match and Safety programs will appear here when ready.
                </Text>
              </View>
            </View>
          );
        }

        const confirmed = items.filter((item) => textValue(item, "approvalStatus") === "approved").length;
        return (
          <View className="gap-3">
            <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              {confirmed} / {items.length} confirmed
            </Text>
            {items.map((item, index) => {
              const id = textValue(item, "id", "programRecordId");
              const status = textValue(item, "approvalStatus", "status") || "pending";
              const pending = status === "pending" || status === "awaiting";
              const approving = pendingDecision === `${id}:approve`;
              const rejecting = pendingDecision === `${id}:reject`;
              return (
                <View key={id || `${programName(item)}-${index}`} className="rounded-2xl border border-border bg-surface px-4 py-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-xs font-bold uppercase text-brand-mid">{universityName(item)}</Text>
                      <Text className="mt-1 text-base font-bold text-text">{programName(item)}</Text>
                    </View>
                    <Text className={cn("rounded-full px-2 py-1 text-[10px] font-bold uppercase", status === "approved" ? "bg-success/10 text-success" : status === "rejected" ? "bg-error/10 text-error" : "bg-warning/10 text-warning")}>{status}</Text>
                  </View>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {[textValue(item, "term", "intake"), textValue(item, "applicationType") === "uniassist" ? "Uni-Assist" : textValue(item, "applicationType"), textValue(item, "category")].filter(Boolean).map((tag) => (
                      <Text key={tag} className="rounded-lg bg-surface-end px-2 py-1 text-[11px] font-semibold text-muted">{tag}</Text>
                    ))}
                  </View>
                  <Text className="mt-3 text-xs font-bold text-text">✨ Why this was matched for you</Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">
                    {textValue(item, "recommendationSummary", "reason", "admissionReasoning") || "Matched based on your profile and preferred intake."}
                  </Text>
                  <View className="mt-4 flex-row gap-2">
                    <Pressable
                      disabled={!pending || pendingDecision !== null}
                      onPress={async () => {
                        if (!id) return;
                        setPendingDecision(`${id}:approve`);
                        try {
                          await postApiJson(`/api/matches/${id}/approve`);
                          await refetch();
                          appAlert("Confirmed", "Your counsellor can now proceed with this application.");
                        } catch (error) {
                          appAlert("Could not confirm", error instanceof Error ? error.message : "Please try again.");
                        } finally {
                          setPendingDecision(null);
                        }
                      }}
                      className={cn("flex-1 rounded-xl px-3 py-3", status === "approved" ? "bg-success/10" : "bg-brand-mid")}
                    >
                      <Text className={cn("text-center text-xs font-bold", status === "approved" ? "text-success" : "text-white")}>{status === "approved" ? "Confirmed" : approving ? "Confirming..." : "Confirm Application"}</Text>
                    </Pressable>
                    {status !== "approved" ? (
                      <Pressable
                        disabled={!pending || pendingDecision !== null}
                        onPress={() => appAlert("Reject this program?", "It will be removed from your active options.", [{ text: "Cancel", style: "cancel" }, { text: "Reject", style: "destructive", onPress: async () => {
                          if (!id) return;
                          setPendingDecision(`${id}:reject`);
                          try {
                            await postApiJson(`/api/matches/${id}/reject`);
                            await refetch();
                          } catch (error) {
                            appAlert("Could not reject", error instanceof Error ? error.message : "Please try again.");
                          } finally {
                            setPendingDecision(null);
                          }
                        } }])}
                        className="rounded-xl border border-border bg-surface-end px-4 py-3"
                      >
                        <Text className="text-xs font-bold text-text">{status === "rejected" ? "Rejected" : rejecting ? "Rejecting..." : "Reject"}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        );
      }}
    </ResourceScreen>
  );
}
