import "@/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BootErrorBoundary } from "@/components/shared/boot-error-boundary";
import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";
import { bootError, bootLog } from "@/lib/debug/boot-log";
import { AppQueryProvider } from "@/lib/query/query-provider";
import { ThemeProvider, useTheme } from "@/lib/theme/theme-context";

// Runs as soon as the JS bundle evaluates — before any React tree mounts.
bootLog("js-bundle:evaluated", {
  expoPublicApiUrl: process.env.EXPO_PUBLIC_API_URL ? "set" : "missing",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? "set" : "missing",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
});

try {
  void SplashScreen.preventAutoHideAsync().then(
    () => bootLog("splash:preventAutoHide:ok"),
    (error) => bootError("splash:preventAutoHide", error),
  );
} catch (error) {
  bootError("splash:preventAutoHide:sync", error);
}

function RootNavigator() {
  const { loading, session, role, homePath } = useAuth();
  const { isDark, ready } = useTheme();

  bootLog("root-navigator:render", {
    authLoading: loading,
    themeReady: ready,
    hasSession: Boolean(session),
    role,
    homePath,
  });

  useEffect(() => {
    bootLog("root-navigator:mounted");
  }, []);

  useEffect(() => {
    if (loading || !ready) {
      bootLog("root-navigator:waiting", { loading, ready });
      return;
    }

    bootLog("root-navigator:ready-to-show-main");
    void SplashScreen.hideAsync()
      .then(() => bootLog("splash:hidden — main screen can paint"))
      .catch((error) => bootError("splash:hide", error));
  }, [loading, ready]);

  if (loading || !ready) {
    return <WorkpunktLoader label="Starting Workpunkt" />;
  }

  bootLog("root-navigator:rendering-stack");

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  bootLog("root-layout:render");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BootErrorBoundary label="root">
          <ThemeProvider>
            <AppQueryProvider>
              <AuthProvider>
                <RootNavigator />
              </AuthProvider>
            </AppQueryProvider>
          </ThemeProvider>
        </BootErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
