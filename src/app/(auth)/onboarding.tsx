import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { postApiJson } from "@/lib/query/use-api";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

const FIELDS = [
  { label: "Full Name", key: "fullName" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Academic Status", key: "academicStatus" },
  { label: "University Type", key: "universityType" },
  { label: "Target Degree", key: "targetDegree" },
  { label: "Target Intake", key: "targetIntake" },
  { label: "City / Region Preference", key: "cityRegion" },
] as const;

const COST = [
  { value: "aware", label: "I understand typical costs" },
  { value: "learning", label: "Still learning about costs" },
  { value: "need-guidance", label: "Need guidance on funding" },
] as const;

const SUBJECTS = [
  { value: "engineering", label: "Engineering / Tech" },
  { value: "business", label: "Business / Management" },
  { value: "design", label: "Design / Arts" },
  { value: "sciences", label: "Natural sciences" },
  { value: "other", label: "Other" },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, homePath, refreshProfile } = useAuth();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const [values, setValues] = useState<Record<string, string>>({
    fullName: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: "",
    academicStatus: "",
    universityType: "",
    targetDegree: "",
    targetIntake: "",
    cityRegion: "",
  });
  const [costAwareness, setCost] = useState("");
  const [preferredSubject, setSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      for (const field of FIELDS) {
        const value = values[field.key]?.trim() ?? "";
        if (!value) continue;
        await postApiJson("/api/student/onboarding", {
          action: "field",
          label: field.label,
          value,
        });
      }

      if (costAwareness || preferredSubject) {
        await postApiJson("/api/student/onboarding", {
          action: "extras",
          costAwareness,
          preferredSubject,
        });
      }

      await refreshProfile();
      router.replace(homePath as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save onboarding.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="Complete your profile"
      subtitle="A few details help us personalise your Workpunkt journey."
      backHref="/(auth)/login"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {FIELDS.map((field) => (
        <TextInput
          key={field.key}
          placeholder={field.label}
          placeholderTextColor={placeholderColor}
          autoCapitalize={field.key === "email" ? "none" : "sentences"}
          keyboardType={field.key === "email" ? "email-address" : "default"}
          value={values[field.key] ?? ""}
          onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
          className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
        />
      ))}

      <Text className="mb-2 mt-2 text-xs font-semibold uppercase text-muted">
        Cost awareness
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {COST.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setCost(option.value)}
            className={cn(
              "rounded-lg border px-3 py-2",
              costAwareness === option.value
                ? "border-brand-mid bg-brand-mid/15"
                : "border-border bg-surface",
            )}
          >
            <Text className="text-xs text-text">{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">
        Preferred subject
      </Text>
      <View className="mb-6 flex-row flex-wrap gap-2">
        {SUBJECTS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSubject(option.value)}
            className={cn(
              "rounded-lg border px-3 py-2",
              preferredSubject === option.value
                ? "border-brand-mid bg-brand-mid/15"
                : "border-border bg-surface",
            )}
          >
            <Text className="text-xs text-text">{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <GradientButton
        text={loading ? "Saving…" : "Finish"}
        loading={loading}
        onPress={() => void onSubmit()}
      />
    </SignupShell>
  );
}
