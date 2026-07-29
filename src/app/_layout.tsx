import "@/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";
import { AppQueryProvider } from "@/lib/query/query-provider";
import { ThemeProvider, useTheme } from "@/lib/theme/theme-context";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { loading } = useAuth();
  const { isDark, ready } = useTheme();

  useEffect(() => {
    if (!loading && ready) {
      void SplashScreen.hideAsync();
    }
  }, [loading, ready]);

  if (loading || !ready) {
    return <WorkpunktLoader label="Starting Workpunkt" />;
  }

  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppQueryProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </AppQueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
