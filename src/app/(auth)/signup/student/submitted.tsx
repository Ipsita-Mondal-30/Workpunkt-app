import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";

export default function StudentSubmittedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; ref?: string }>();

  return (
    <SignupShell
      title="Application submitted"
      subtitle="Thanks — our team will review your application shortly."
      backHref="/(auth)/login"
    >
      <View className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4">
        {params.ref ? (
          <Text className="text-sm text-text">Reference: {params.ref}</Text>
        ) : null}
        {params.email ? (
          <Text className="mt-2 text-sm text-muted">
            Confirmation sent to {params.email}. Use the email link to sign in to your
            portal.
          </Text>
        ) : null}
      </View>
      <GradientButton text="Go to sign in" onPress={() => router.replace("/(auth)/login")} />
    </SignupShell>
  );
}
