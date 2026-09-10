import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientButton } from "@/components/shared/gradient-button";
import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";

type SignupRole = {
  label: string;
  href: "/(auth)/signup/student" | "/(auth)/signup/agent" | "/(auth)/signup/counsellor";
};

const SIGNUP_ROLES: SignupRole[] = [
  { label: "Sign up as student", href: "/(auth)/signup/student" },
  { label: "Sign up as partner", href: "/(auth)/signup/agent" },
  { label: "Sign up as school counsellor", href: "/(auth)/signup/counsellor" },
];

function OutlineLinkButton({
  label,
  onPress,
  isDark,
}: {
  label: string;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: "47%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: pressed
          ? "rgba(186, 67, 237, 0.45)"
          : isDark
            ? "rgba(255,255,255,0.12)"
            : "#e4e4e7",
        backgroundColor: pressed
          ? isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(14,11,17,0.03)"
          : "transparent",
        paddingHorizontal: 14,
        paddingVertical: 12,
      })}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: isDark ? "#ffffff" : "#0e0b11",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LoginForm() {
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const pageBg = isDark ? "#09090b" : "#faf7fc";
  const panelBg = isDark ? "rgba(9,9,11,0.92)" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(228,228,231,0.95)";
  const textColor = isDark ? "#ffffff" : "#0e0b11";
  const mutedColor = isDark ? "#a1a1aa" : "#71717a";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "#e4e4e7";

  async function onSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace(result.homePath as never);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: pageBg }} edges={["top", "bottom", "left", "right"]}>
      <LinearGradient
        colors={
          isDark
            ? ["#09090b", "#1a1020", "#09090b"]
            : ["#faf7fc", "#fff5fb", "#f7f0ff"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingVertical: 28,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ marginBottom: 20, alignItems: "flex-start" }}>
              <WorkpunktLogo fontSize={34} />
            </View>

            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: panelBorder,
                backgroundColor: panelBg,
                paddingHorizontal: 20,
                paddingVertical: 24,
                gap: 20,
                shadowColor: "#ad46ff",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: isDark ? 0.18 : 0.08,
                shadowRadius: 28,
                elevation: 6,
              }}
            >
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: textColor,
                    letterSpacing: -0.4,
                  }}
                >
                  Login
                </Text>
                <Text style={{ fontSize: 15, color: mutedColor, lineHeight: 22 }}>
                  Enter your account details
                </Text>
              </View>

              {error ? (
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(220,38,38,0.3)",
                    backgroundColor: "rgba(220,38,38,0.1)",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#dc2626" }}>{error}</Text>
                </View>
              ) : null}

              <View style={{ gap: 14 }}>
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: mutedColor,
                    }}
                  >
                    Email
                  </Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="email@example.com"
                    placeholderTextColor={placeholderColor}
                    value={email}
                    onChangeText={setEmail}
                    style={{
                      height: 56,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: inputBorder,
                      backgroundColor: inputBg,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: textColor,
                    }}
                  />
                </View>

                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: mutedColor,
                    }}
                  >
                    Password
                  </Text>
                  <TextInput
                    secureTextEntry
                    autoComplete="password"
                    placeholder="Password"
                    placeholderTextColor={placeholderColor}
                    value={password}
                    onChangeText={setPassword}
                    style={{
                      height: 56,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: inputBorder,
                      backgroundColor: inputBg,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: textColor,
                    }}
                  />
                </View>
              </View>

              <GradientButton
                text={loading ? "Signing in…" : "Sign in"}
                loading={loading}
                onPress={() => void onSubmit()}
              />

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#e4e4e7",
                  paddingTop: 16,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: mutedColor,
                  }}
                >
                  Don't have an account?
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {SIGNUP_ROLES.map((role) => (
                    <OutlineLinkButton
                      key={role.href}
                      label={role.label}
                      isDark={isDark}
                      onPress={() => router.push(role.href)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <Text
              style={{
                marginTop: 18,
                textAlign: "center",
                fontSize: 12,
                color: mutedColor,
                lineHeight: 18,
              }}
            >
              One sign-in for students, agents, counsellors, and admins.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
