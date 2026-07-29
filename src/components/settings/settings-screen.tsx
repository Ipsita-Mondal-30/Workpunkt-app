import { Pressable, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";

export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    console.log("[settings] sign out");
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-bg px-4 py-6">
      <Text className="text-2xl font-bold text-text">Settings</Text>
      <Text className="mt-2 text-sm text-muted">
        {profile?.email ?? "Manage your app preferences"}
      </Text>

      <View className="mt-8 rounded-2xl border border-border bg-surface px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-text">Appearance</Text>
            <Text className="mt-1 text-sm text-muted">
              {isDark ? "Dark mode" : "Light mode"}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => void toggleTheme()}
            trackColor={{ false: "#e4e4e7", true: "#f6339a" }}
            thumbColor="#ffffff"
            accessibilityLabel="Toggle dark mode"
          />
        </View>
        <Text className="mt-3 text-xs text-muted">
          Current theme: {theme}. Preference is saved on this device.
        </Text>
      </View>

      <Pressable
        onPress={() => void handleSignOut()}
        className="mt-6 rounded-2xl border border-error/40 bg-error/10 px-4 py-4"
      >
        <Text className="text-center text-base font-semibold text-error">Log out</Text>
      </Pressable>
    </View>
  );
}
