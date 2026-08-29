import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { studentSubmittedCopy } from "@/lib/signup/copy";

export default function StudentSubmittedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; ref?: string }>();
  const copy = studentSubmittedCopy;

  return (
    <SignupShell title={copy.title} subtitle={copy.subtitle} backHref="/(auth)/login">
      {params.ref ? (
        <View className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            {copy.referenceLabel}
          </Text>
          <Text className="mt-1 text-base font-semibold text-text">{params.ref}</Text>
        </View>
      ) : null}

      <Text className="mb-3 text-base font-semibold text-text">{copy.nextTitle}</Text>
      <View className="mb-6 gap-3">
        {copy.nextSteps.map((step, index) => (
          <View key={step.id} className="rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              Step {index + 1}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-text">{step.title}</Text>
            <Text className="mt-1 text-sm text-muted">{step.description}</Text>
          </View>
        ))}
      </View>

      {params.email ? (
        <Text className="mb-6 text-sm text-muted">
          Confirmation sent to {params.email}. Use the email link to sign in to your portal.
        </Text>
      ) : null}

      <GradientButton text={copy.cta} onPress={() => router.replace("/(auth)/login")} />
    </SignupShell>
  );
}
