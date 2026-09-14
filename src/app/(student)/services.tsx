import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { postApiJson } from "@/lib/query/use-api";

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
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-4 py-5 pb-12">
      <Text className="text-2xl font-bold text-text">Germany Support Services</Text>
      <Text className="mt-2 text-sm leading-5 text-muted">Choose the support you need. Your private-university application through Workpunkt remains free.</Text>
      <View className="mt-5 rounded-3xl border border-brand-mid/20 bg-brand-start/10 px-5 py-5">
        <Text className="text-xs font-bold uppercase tracking-wider text-brand-mid">Private university application</Text>
        <Text className="mt-1 text-3xl font-black text-text">FREE</Text>
        <Text className="text-xs font-bold uppercase text-muted">Always & forever</Text>
      </View>
      <View className="mt-5 gap-3">
        {SERVICES.map((service) => (
          <View key={service.id} className="rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-base font-bold text-text">{service.title}</Text>
            <Text className="mt-2 text-sm leading-5 text-muted">{service.description}</Text>
            <View className="mt-4 flex-row items-end justify-between gap-3">
              <View><Text className="text-lg font-black text-brand-mid">{service.price}</Text><Text className="text-[11px] text-muted">{service.note}</Text></View>
              <Pressable disabled={Boolean(pending)} onPress={() => void request(service)} className="rounded-xl bg-brand-mid px-4 py-3">
                <Text className="text-xs font-bold text-white">{pending === service.id ? "Sending…" : "+ Add"}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
