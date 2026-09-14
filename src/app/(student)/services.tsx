import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { postApiJson } from "@/lib/query/use-api";
import { PageHeading, PortalHero, PortalIcon, PortalPage } from "@/components/portal/portal-ui";
import { GradientButton } from "@/components/shared/gradient-button";

const SERVICES = [
  { id: "visa", title: "Green Light — APS + Student Visa Support", description: "Every document APS and the visa office need, prepared right the first time.", price: "€299", note: "One-time" },
  { id: "arrival", title: "Soft Landing — Germany Arrival Package", description: "Blocked account, insurance, Anmeldung, SIM and visa extension support.", price: "€499", note: "One-time" },
  { id: "accommodation", title: "Key In Hand — Accommodation Search", description: "Checked WG, student residence or private rental options before you arrive.", price: "€199", note: "One-time" },
  { id: "residence", title: "Red Tape, Sorted", description: "Anmeldung, residence permit extensions and appointment support in Germany.", price: "€199", note: "One-time" },
  { id: "language", title: "Sprachpunkt — German Language Support", description: "A1 to B2.2 for university and everyday life in Germany.", price: "€200 per level", note: "One-time" },
  { id: "report", title: "Real Odds — Detailed Klara Report", description: "AI recommendations backed by review from Workpunkt counsellors.", price: "€29", note: "Detailed report" },
] as const;

export default function StudentServicesScreen() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function request(service: (typeof SERVICES)[number]) {
    setPending(service.id);
    try {
      await postApiJson("/api/support/inbox", {
        kind: "student_help",
        message: `I am interested in ${service.title}. Listed price: ${service.price} (${service.note}). Please help me with the next step.`,
      });
      Alert.alert("Request sent", "A counsellor will follow up in your Help chat.", [
        { text: "Open chat", onPress: () => router.push("/(student)/support") },
      ]);
    } catch (error) {
      Alert.alert("Could not send request", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <PortalPage>
      <PageHeading eyebrow="A LITTLE HELP. A LONG WAY." title="Support for your Germany journey." subtitle="Choose the support you need, from your first application to settling into a new city." />
      <PortalHero eyebrow="PRIVATE UNIVERSITY APPLICATION" title="Free. Always & forever." description="Your private-university application through Workpunkt remains free. Add extra support only where you need it." />
      <Text className="mb-5 text-sm leading-6 text-muted">Request a service to speak with your counsellor. Sending a request does not charge you or complete a purchase.</Text>
      <View className="flex-row flex-wrap gap-4">
        {SERVICES.map((service) => (
          <View key={service.id} style={{ flexBasis: 280, flexGrow: 1, flexShrink: 1 }} className="rounded-3xl border border-border bg-surface p-5">
            <View className="mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-brand-start/10"><PortalIcon name={service.id === "report" ? "sparkle" : service.id === "language" ? "book" : service.id === "accommodation" ? "home" : "file"} /></View>
            <Text className="text-base font-bold text-text">{service.title}</Text>
            <Text className="mt-2 text-sm leading-5 text-muted">{service.description}</Text>
            <View className="mt-5 flex-1 justify-end gap-4">
              <View><Text className="text-lg font-black text-brand-mid">{service.price}</Text><Text className="text-[11px] text-muted">{service.note}</Text></View>
              <GradientButton text="Request this service" accessibilityLabel={`Request ${service.title}`} loading={pending === service.id} disabled={Boolean(pending)} onPress={() => void request(service)} />
            </View>
          </View>
        ))}
      </View>
    </PortalPage>
  );
}
