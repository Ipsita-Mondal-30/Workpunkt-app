import { SettingsScreen } from "@/components/settings/settings-screen";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";

export default function CounsellorSettingsScreen() {
  return (
    <CounsellorScreenShell title="Settings">
      <SettingsScreen />
    </CounsellorScreenShell>
  );
}
