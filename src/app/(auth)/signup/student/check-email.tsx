import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";

export default function StudentCheckEmailScreen() {
  const router = useRouter();

  return (
    <SignupShell
      title="Check your email"
      subtitle="We sent a secure link to continue. You can also keep filling your application now — open the email later to sign in to your portal."
      backHref="/(auth)/signup/student"
    >
      <View className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="text-sm text-muted">
          Look for an email from Workpunkt. On your phone, the link opens this app when
          installed; otherwise it opens the website.
        </Text>
      </View>

      <GradientButton
        text="Continue application"
        onPress={() => router.push("/(auth)/signup/student/academic")}
      />
      <View className="h-3" />
      <GradientButton
        text="Back to sign in"
        onPress={() => router.replace("/(auth)/login")}
      />
    </SignupShell>
  );
}
