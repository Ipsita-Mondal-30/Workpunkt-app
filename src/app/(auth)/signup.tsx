import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";

const ROLES = [
  {
    key: "student",
    title: "Student",
    body: "Create a free account and apply to private universities in Germany.",
    href: "/(auth)/signup/student",
  },
  {
    key: "agent",
    title: "Agent / Partner",
    body: "Become a Workpunkt Partner and recruit students for German universities.",
    href: "/(auth)/signup/agent",
  },
  {
    key: "counsellor",
    title: "School Counsellor",
    body: "Create your school counsellor account for Counselor Access (₹5,000).",
    href: "/(auth)/signup/counsellor",
  },
] as const;

export default function SignupRolePickerScreen() {
  const router = useRouter();

  return (
    <SignupShell
      title="Create an account"
      subtitle="Choose how you want to join Workpunkt."
      backHref="/(auth)/login"
    >
      <View className="gap-3">
        {ROLES.map((role) => (
          <Pressable
            key={role.key}
            onPress={() => router.push(role.href as never)}
            className="rounded-2xl border border-border bg-surface px-4 py-4"
          >
            <Text className="text-base font-semibold text-text">{role.title}</Text>
            <Text className="mt-1 text-sm text-muted">{role.body}</Text>
          </Pressable>
        ))}
      </View>
    </SignupShell>
  );
}
