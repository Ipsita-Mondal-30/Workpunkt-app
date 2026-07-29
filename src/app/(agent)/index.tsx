import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { useAuth } from "@/lib/auth/auth-context";

export default function AgentHome() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg px-4 py-6">
      <Text className="text-2xl font-bold text-text">Partner Agent</Text>
      <Text className="mt-2 text-base text-muted">
        {profile?.name ? `Welcome back, ${profile.name}` : "Your partner dashboard"}
      </Text>

      <View className="mt-8 gap-4">
        <GradientButton
          text="My Students"
          onPress={() => router.push("/(agent)/students")}
        />
        <GradientButton text="Ask Klara" onPress={() => router.push("/(agent)/klara")} />
      </View>
    </View>
  );
}
