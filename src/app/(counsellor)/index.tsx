import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ApiListScreen } from "@/components/shared/api-list-screen";
import { GradientButton } from "@/components/shared/gradient-button";
import { useAuth } from "@/lib/auth/auth-context";

type CareerStudent = {
  id: string;
  name?: string;
  email?: string;
  status?: string;
};

export default function CounsellorHome() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg">
      <View className="border-b border-border px-4 py-4">
        <Text className="text-2xl font-bold text-text">Career Pathing</Text>
        <Text className="mt-2 text-base text-muted">
          {profile?.name
            ? `Welcome, ${profile.name}`
            : "Students and roadmaps for your school"}
        </Text>
        <View className="mt-4 gap-3">
          <GradientButton
            text="Resource Library"
            onPress={() => router.push("/(counsellor)/resources")}
          />
          <GradientButton
            text="Ask Klara"
            onPress={() => router.push("/(counsellor)/klara")}
          />
        </View>
        <Text className="mt-6 text-lg font-semibold text-text">Students</Text>
        <Text className="mt-1 text-sm text-muted">Career Pathing roster</Text>
      </View>

      <ApiListScreen<CareerStudent>
        path="/api/agent/career-pathing"
        emptyLabel="No Career Pathing students yet."
        extract={(json) => {
          const payload = json as {
            data?: { ok?: boolean; students?: CareerStudent[]; error?: string };
          };
          if (!payload.data || payload.data.ok === false) return [];
          return payload.data.students ?? [];
        }}
        renderItem={(item) => (
          <View className="rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-base font-semibold text-text">
              {item.name || item.email || item.id}
            </Text>
            {item.email ? (
              <Text className="mt-1 text-sm text-muted">{item.email}</Text>
            ) : null}
            {item.status ? (
              <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
                {String(item.status)}
              </Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}
