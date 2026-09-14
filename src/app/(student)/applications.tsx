import { Text, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";
import { applicationRecords, asRecord, asRecords, dateLabel, statusTone, textValue } from "@/lib/student/presentation";
import { cn } from "@/lib/utils";

const DEFAULT_STEPS = ["Application received", "Profile review", "Program confirmed", "Application filed", "University decision"];

export default function StudentApplicationsScreen() {
  return (
    <ResourceScreen<unknown>
      title="Application Status"
      subtitle="Live updates from your Workpunkt counsellor"
      queryKey={queryKeys.studentApplications()}
      path="/api/applications"
      staleTime={30_000}
    >
      {(data) => {
        const applications = applicationRecords(data);
        if (!applications.length) {
          return (
            <View className="rounded-3xl border border-brand-mid/20 bg-brand-start/10 px-5 py-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-brand-mid">Application received</Text>
              <Text className="mt-2 text-xl font-bold text-text">Relax — we've got your application</Text>
              <Text className="mt-2 text-sm leading-5 text-muted">Your record is being prepared. It will appear here after your counsellor moves it into Applications Ops.</Text>
            </View>
          );
        }

        return (
          <View className="gap-4">
            {applications.map((item, index) => {
              const currentPhase = asRecord(item.currentPhase);
              const status = textValue(item, "status", "stage", "currentPhase") || (currentPhase ? textValue(currentPhase, "title", "label", "status", "name") : "") || "Submitted";
              const journey = asRecord(item.journey);
              const rawSteps = journey && Array.isArray(journey.steps) ? asRecords(journey.steps) : [];
              const currentIndex = Math.max(0, DEFAULT_STEPS.findIndex((step) => status.toLowerCase().includes(step.split(" ")[0].toLowerCase())));
              return (
                <View key={textValue(item, "id", "reference", "applicationReference") || String(index)} className="rounded-2xl border border-border bg-surface px-4 py-5">
                  <Text className="text-xs font-bold uppercase text-brand-mid">{textValue(item, "reference", "applicationReference") || `Application ${index + 1}`}</Text>
                  <Text className="mt-2 text-lg font-bold text-text">{textValue(item, "programName", "degreeName", "program", "universityName", "university") || "University application"}</Text>
                  {textValue(item, "universityName", "university") ? <Text className="mt-1 text-sm text-muted">{textValue(item, "universityName", "university")}</Text> : null}
                  {journey && textValue(journey, "title") ? <Text className="mt-2 text-xs font-semibold text-muted">{textValue(journey, "title")}</Text> : null}
                  <Text className={cn("mt-3 self-start rounded-full px-3 py-1 text-xs font-bold", statusTone(status) === "success" ? "bg-success/10 text-success" : statusTone(status) === "warning" ? "bg-warning/10 text-warning" : "bg-surface-end text-muted")}>{status}</Text>

                  <View className="mt-5 gap-0">
                    {(rawSteps.length ? rawSteps : DEFAULT_STEPS.map((title, stepIndex) => ({ title, status: stepIndex < currentIndex ? "complete" : stepIndex === currentIndex ? "active" : "pending" }))).map((step, stepIndex, all) => {
                      const stepStatus = textValue(step, "status") || "pending";
                      const complete = stepStatus === "complete";
                      const active = stepStatus === "active";
                      return (
                        <View key={textValue(step, "id", "title") || String(stepIndex)} className="flex-row">
                          <View className="items-center">
                            <View className={cn("h-6 w-6 items-center justify-center rounded-full", complete ? "bg-success" : active ? "bg-brand-mid" : "bg-surface-end")}><Text className={cn("text-[10px] font-bold", complete || active ? "text-white" : "text-muted")}>{complete ? "✓" : stepIndex + 1}</Text></View>
                            {stepIndex < all.length - 1 ? <View className={cn("h-9 w-0.5", complete ? "bg-success" : "bg-border")} /> : null}
                          </View>
                          <View className="ml-3 flex-1 pb-4">
                            <Text className="text-sm font-semibold text-text">{textValue(step, "title")}</Text>
                            {textValue(step, "body") ? <Text className="mt-1 text-xs text-muted">{textValue(step, "body")}</Text> : null}
                            {textValue(step, "date", "updatedAt", "createdAt") ? <Text className="mt-1 text-[11px] text-muted">{dateLabel(textValue(step, "date", "updatedAt", "createdAt"))}</Text> : null}
                          </View>
                        </View>
                      );
                    })}
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
