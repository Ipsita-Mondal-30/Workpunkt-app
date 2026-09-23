import { Tabs } from "expo-router";
import { Text } from "react-native";

import { useThemeColors } from "@/lib/theme/theme-context";

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 18 }}>{label}</Text>;
}

export default function CounsellorTabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandMid,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => <TabIcon label="🏠" />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: () => <TabIcon label="🎓" />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarIcon: () => <TabIcon label="📚" />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Training",
          tabBarIcon: () => <TabIcon label="🎯" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: () => <TabIcon label="⋯" />,
        }}
      />
    </Tabs>
  );
}
