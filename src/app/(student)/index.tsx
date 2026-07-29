import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { useAuth } from "@/lib/auth/auth-context";

export default function StudentHome() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg px-4 py-6">
      <Text className="text-2xl font-bold text-text">
        Welcome{profile?.name ? `, ${profile.name}` : ""}
      </Text>
      <Text className="mt-2 text-base text-muted">
        Your student dashboard. Explore matched programs or ask Klara for guidance.
      </Text>

      <View className="mt-8 gap-4">
        <GradientButton
          text="Matched Programs"
          onPress={() => router.push("/(student)/matches")}
        />
        <GradientButton
          text="Ask Klara"
          onPress={() => router.push("/(student)/klara")}
        />
      </View>
    </View>
  );
}
