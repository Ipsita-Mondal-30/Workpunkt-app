import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordField } from "@/components/auth/password-field";
import { GradientButton } from "@/components/shared/gradient-button";
import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";
import type { ThemeColors } from "@/lib/theme/theme-colors";

type SignupRole = {
  label: string;
  href: "/(auth)/signup/student" | "/(auth)/signup/agent" | "/(auth)/signup/counsellor";
};

const SIGNUP_ROLES: SignupRole[] = [
  { label: "Sign up as student", href: "/(auth)/signup/student" },
  { label: "Sign up as partner", href: "/(auth)/signup/agent" },
  { label: "Sign up as school counsellor", href: "/(auth)/signup/counsellor" },
];

function formatAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Email or password is incorrect. Please try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  return message;
}

function OutlineLinkButton({
  label,
  onPress,
  colors,
}: {
  label: string;
  onPress: () => void;
  colors: ThemeColors;
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
        borderColor: pressed ? "rgba(186, 67, 237, 0.45)" : colors.border,
        backgroundColor: pressed ? colors.inputBg : "transparent",
        paddingHorizontal: 14,
        paddingVertical: 12,
      })}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.text,
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
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInputType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(formatAuthError(result.error));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    router.replace(result.homePath as never);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top", "bottom", "left", "right"]}>
      <LinearGradient
        colors={colors.pageGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 48,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginBottom: 20, alignItems: "flex-start" }}>
              <WorkpunktLogo fontSize={34} />
            </View>

            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.panelBorder,
                backgroundColor: colors.panelBg,
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
                    color: colors.text,
                    letterSpacing: -0.4,
                  }}
                >
                  Login
                </Text>
                <Text style={{ fontSize: 15, color: colors.muted, lineHeight: 22 }}>
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
                  <Text style={{ fontSize: 13, color: "#dc2626", lineHeight: 18 }}>
                    {error}
                  </Text>
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
                      color: colors.muted,
                    }}
                  >
                    Email
                  </Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="email@example.com"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    style={{
                      height: 56,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.inputBg,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: colors.text,
                    }}
                  />
                </View>

                <PasswordField
                  ref={passwordRef}
                  label="Password"
                  autoComplete="password"
                  placeholder="Password"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="go"
                  onSubmitEditing={() => void onSubmit()}
                  onFocus={() => {
                    // Keep password + button above the keyboard on smaller screens.
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.inputBg,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
              </View>

              <GradientButton
                text={loading ? "Signing in…" : "Sign in"}
                loading={loading}
                onPress={() => void onSubmit()}
              />

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: 16,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: colors.muted,
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
                      colors={colors}
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
                color: colors.muted,
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
