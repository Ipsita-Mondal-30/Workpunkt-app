import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientButton } from "@/components/shared/gradient-button";
import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";

  async function onSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    console.log("[login] submitting", { email: email.trim() });
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    console.log("[login] redirect after sign-in", {
      role: result.role,
      homePath: result.homePath,
    });
    router.replace(result.homePath as never);
  }

  async function openSignup() {
    const url =
      process.env.EXPO_PUBLIC_SIGNUP_URL ??
      `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"}/login`;
    console.log("[login] open signup", url);
    await WebBrowser.openBrowserAsync(url);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom", "left", "right"]}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-bg"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10 items-center">
          <WorkpunktLogo fontSize={42} />
          <Text className="mt-4 text-center text-base text-muted">
            Sign in to your Workpunkt account
          </Text>
        </View>

        {error ? (
          <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
            <Text className="text-sm text-error">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="email@example.com"
            placeholderTextColor={placeholderColor}
            value={email}
            onChangeText={setEmail}
            className={cn(
              "rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text",
            )}
          />
        </View>

        <View className="mb-6">
          <TextInput
            secureTextEntry
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            className="rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
          />
        </View>

        <GradientButton
          text={loading ? "Signing in…" : "Sign in"}
          loading={loading}
          onPress={() => void onSubmit()}
        />

        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-border" />
          <Text className="px-3 text-sm text-muted">or</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <GradientButton text="Sign up" onPress={() => void openSignup()} />

        <Text className="mt-6 text-center text-sm text-muted">
          One sign-in for students, agents, counsellors, and admins.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
