import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { useAuth } from "@/lib/auth/auth-context";

const SHORTCUTS = [
  { label: "Users / Leads", href: "/(admin)/leads" },
  { label: "Student Pipeline", href: "/(admin)/pipeline" },
  { label: "Applications Ops", href: "/(admin)/applications-ops" },
  { label: "Help & Chat", href: "/(admin)/help-chat" },
  { label: "Agents & Partners", href: "/(admin)/agents-partners" },
  { label: "Email Logs", href: "/(admin)/email-logs" },
] as const;

export default function AdminHome() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg px-4 py-6">
      <Text className="text-2xl font-bold text-text">Admin</Text>
      <Text className="mt-2 text-base text-muted">
        {profile?.name ? `Signed in as ${profile.name}` : "Operations overview"}
      </Text>

      <View className="mt-8 gap-3">
        {SHORTCUTS.map((item) => (
          <GradientButton
            key={item.href}
            text={item.label}
            onPress={() => router.push(item.href as never)}
          />
        ))}
      </View>
    </View>
  );
}
