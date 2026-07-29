import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminHome() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg px-4 py-6">
      <Text className="text-2xl font-bold text-text">Admin</Text>
      <Text className="mt-2 text-base text-muted">
        {profile?.name ? `Signed in as ${profile.name}` : "Operations overview"}
      </Text>

      <View className="mt-8 gap-4">
        <GradientButton
          text="Student Pipeline"
          onPress={() => router.push("/(admin)/pipeline")}
        />
        <GradientButton
          text="Users / Leads"
          onPress={() => router.push("/(admin)/leads")}
        />
      </View>
    </View>
  );
}
