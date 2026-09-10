import { Text } from "react-native";

import { CounsellorScroll, SectionCard } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function ProfileScreen() {
  const { me } = useCounsellorContext();
  const profile = me?.profile;

  return (
    <CounsellorScreenShell title="Profile">
      <CounsellorScroll>
        <SectionCard title="Account">
          <Text className="mt-2 text-base text-text">{profile?.name ?? "—"}</Text>
          <Text className="mt-2 text-sm text-muted">{profile?.email ?? "—"}</Text>
          <Text className="mt-2 text-sm text-muted">
            Role: {profile?.role ?? "school_counsellor"}
          </Text>
        </SectionCard>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
