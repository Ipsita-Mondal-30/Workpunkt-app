import { Linking, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";
import { applicationRecords, collectDocuments, textValue } from "@/lib/student/presentation";

const CHECKLIST = [
  { id: "offer", title: "Accept your offer", detail: "Review the offer letter and acceptance deadline." },
  { id: "fees", title: "Pay university fees", detail: "Follow the payment instructions from your university." },
  { id: "aps", title: "APS certificate", detail: "Prepare, submit and track your APS documents." },
  { id: "account", title: "Blocked account", detail: "Arrange the required proof of finances." },
  { id: "insurance", title: "Health insurance", detail: "Choose compliant incoming and student cover." },
  { id: "visa", title: "Student visa application", detail: "Complete your checklist, appointment and interview prep." },
  { id: "housing", title: "Accommodation", detail: "Secure a checked place to stay before arrival." },
  { id: "arrival", title: "Pre-departure & arrival", detail: "Plan travel, registration, SIM and residence permit." },
] as const;

export default function StudentPostAdmissionScreen() {
  const router = useRouter();
  return (
    <ResourceScreen<unknown>
      title="Post-Admission Checklist"
      subtitle="Everything to complete before you land in Germany"
      queryKey={queryKeys.studentApplications()}
      path="/api/applications"
    >
      {(data) => {
        const applications = applicationRecords(data);
        const offered = applications.find((item) => /offer|grant|accept|admit/i.test(textValue(item, "status", "stage")));
        const offerLetter = collectDocuments(data).find((item) => /offer/i.test(textValue(item, "label", "documentId", "fileName")));
        const completedText = JSON.stringify(data).toLowerCase();
        return (
          <View className="gap-4">
            {offered ? (
              <View className="rounded-3xl border border-success/20 bg-success/10 px-5 py-5">
                <Text className="text-xs font-bold uppercase text-success">Offer letter received</Text>
                <Text className="mt-2 text-xl font-bold text-text">{textValue(offered, "universityName", "university") || "You have your offer!"}</Text>
                <Text className="mt-1 text-sm text-muted">{textValue(offered, "programName", "degreeName", "program")}</Text>
                {offerLetter && textValue(offerLetter, "downloadUrl", "url") ? <Pressable onPress={() => void Linking.openURL(textValue(offerLetter, "downloadUrl", "url"))} className="mt-4 self-start rounded-xl bg-success px-4 py-3"><Text className="text-xs font-bold text-white">Download Offer Letter</Text></Pressable> : null}
              </View>
            ) : (
              <View className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-4">
                <Text className="text-sm font-bold text-warning">This checklist unlocks with your offer</Text>
                <Text className="mt-1 text-sm text-muted">You can review the steps now and ask your counsellor about preparation.</Text>
              </View>
            )}

            <View className="rounded-2xl border border-border bg-surface px-4 py-2">
              {CHECKLIST.map((step, index) => {
                const completed = completedText.includes(`\"${step.id}\":true`) || (step.id === "offer" && Boolean(offered));
                return <View key={step.id} className={index === CHECKLIST.length - 1 ? "flex-row py-4" : "flex-row border-b border-border py-4"}>
                  <View className={completed ? "h-7 w-7 items-center justify-center rounded-full bg-success" : "h-7 w-7 items-center justify-center rounded-full bg-surface-end"}><Text className={completed ? "text-xs font-bold text-white" : "text-xs font-bold text-muted"}>{completed ? "✓" : index + 1}</Text></View>
                  <View className="ml-3 flex-1"><Text className="text-sm font-bold text-text">{step.title}</Text><Text className="mt-1 text-xs leading-5 text-muted">{step.detail}</Text></View>
                </View>;
              })}
            </View>

            <Pressable onPress={() => router.push("/(student)/services")} className="rounded-2xl bg-brand-mid px-4 py-4"><Text className="text-center text-sm font-bold text-white">Explore post-admission support</Text></Pressable>
            <Pressable onPress={() => router.push("/(student)/support")} className="rounded-2xl border border-border bg-surface px-4 py-4"><Text className="text-center text-sm font-bold text-text">Ask your counsellor</Text></Pressable>
          </View>
        );
      }}
    </ResourceScreen>
  );
}
