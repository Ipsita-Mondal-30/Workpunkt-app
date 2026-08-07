import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";

export default function SignupPendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const isCounsellor = params.role === "counsellor";

  return (
    <SignupShell
      title="Application received"
      subtitle={
        isCounsellor
          ? "Our team will review your school counsellor application. After approval you will get an email to activate your portal."
          : "Our team will review your partner application. After approval you will get an email to activate your portal."
      }
      backHref="/(auth)/login"
    >
      <View className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="text-sm text-muted">
          Open the activation link from your phone — it opens this app when installed,
          otherwise the website.
        </Text>
      </View>
      <GradientButton text="Back to sign in" onPress={() => router.replace("/(auth)/login")} />
    </SignupShell>
  );
}
