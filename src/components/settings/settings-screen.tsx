import { Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import { useAuth } from "@/lib/auth/auth-context";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_COMPANY,
  legalNavLinks,
  legalPaths,
} from "@/lib/legal";
import { useTheme } from "@/lib/theme/theme-context";

function siteBaseUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (apiUrl) return apiUrl;
  return LEGAL_COMPANY.website.replace(/\/$/, "");
}

export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    console.log("[settings] sign out");
    await signOut();
    router.replace("/(auth)/login");
  }

  function openContact() {
    void Linking.openURL(`mailto:${LEGAL_CONTACT_EMAIL}`);
  }

  async function openWebVersion(webPath: string) {
    const url = `${siteBaseUrl()}${webPath}`;
    await WebBrowser.openBrowserAsync(url);
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-4 py-6 pb-12">
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

      <View className="mt-6 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="text-base font-semibold text-text">Legal</Text>
        <Text className="mt-1 text-sm text-muted">
          Policies and company information (available offline).
        </Text>

        <View className="mt-3">
          {legalNavLinks.map((link, index) => (
            <Pressable
              key={link.slug}
              onPress={() => router.push(link.href as never)}
              className={`py-3 ${index < legalNavLinks.length - 1 ? "border-b border-border" : ""}`}
            >
              <Text className="text-sm font-medium text-text">{link.label}</Text>
            </Pressable>
          ))}

          <Pressable onPress={openContact} className="border-t border-border py-3">
            <Text className="text-sm font-medium text-text">Contact</Text>
            <Text className="mt-0.5 text-xs text-muted">{LEGAL_CONTACT_EMAIL}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() =>
          void openWebVersion(legalPaths.privacyPolicy).catch(() => undefined)
        }
        className="mt-4 px-1"
      >
        <Text className="text-center text-xs text-muted underline">
          Open website privacy policy
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void handleSignOut()}
        className="mt-6 rounded-2xl border border-error/40 bg-error/10 px-4 py-4"
      >
        <Text className="text-center text-base font-semibold text-error">Log out</Text>
      </Pressable>
    </ScrollView>
  );
}
