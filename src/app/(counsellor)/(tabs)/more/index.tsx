import { useRouter } from "expo-router";
import { Text } from "react-native";

import { CounsellorScroll, ListRow } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function MoreScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { careerPathingActive, counsellorAccessPaid } = useCounsellorContext();

  return (
    <CounsellorScreenShell title="More" subtitle="Account, support, and settings">
      <CounsellorScroll>
        <ListRow
          title="Student Programs"
          subtitle={
            counsellorAccessPaid
              ? "Matched programs for your students"
              : "Requires Counselor Access"
          }
          onPress={() => router.push("/(counsellor)/(tabs)/more/student-programs")}
        />
        <ListRow
          title="Payments"
          subtitle="Plans, quota, and purchase history"
          onPress={() => router.push("/(counsellor)/(tabs)/more/payments")}
        />
        <ListRow
          title="Ask Klara"
          subtitle="AI assistant + program matching"
          onPress={() => router.push("/(counsellor)/(tabs)/more/klara")}
        />
        <ListRow
          title="Message team"
          subtitle="Partner support inbox"
          onPress={() => router.push("/(counsellor)/(tabs)/more/support")}
        />
        <ListRow
          title="Career Pathing"
          subtitle={careerPathingActive ? "Plan active" : "Upgrade for school roadmaps"}
          onPress={() => router.push("/(counsellor)/(tabs)/more/career-pathing")}
        />
        {careerPathingActive ? (
          <>
            <ListRow
              title="Roadmaps"
              subtitle="Approved Grade 10–12 roadmaps"
              onPress={() => router.push("/(counsellor)/(tabs)/more/roadmaps")}
            />
            <ListRow
              title="Prospects"
              subtitle="Overflow students outside quota"
              onPress={() => router.push("/(counsellor)/(tabs)/more/prospects")}
            />
            <ListRow
              title="Placement rewards"
              subtitle="Germany trip progress"
              onPress={() => router.push("/(counsellor)/(tabs)/more/placement-rewards")}
            />
          </>
        ) : null}
        <ListRow
          title="Notifications"
          subtitle="Roadmaps, payments, and updates"
          onPress={() => router.push("/(counsellor)/(tabs)/more/notifications")}
        />
        <ListRow
          title="Profile"
          subtitle="Name, email, and school"
          onPress={() => router.push("/(counsellor)/(tabs)/more/profile")}
        />
        <ListRow
          title="Settings"
          subtitle="Theme and account"
          onPress={() => router.push("/(counsellor)/(tabs)/more/settings")}
        />
        <ListRow
          title="Log out"
          subtitle="Sign out of Workpunkt"
          onPress={() => void signOut()}
        />
        <Text className="mt-6 text-center text-xs text-muted">
          Workpunkt School Counsellor
        </Text>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
