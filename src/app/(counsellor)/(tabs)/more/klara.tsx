import { KlaraMatchingScreen } from "@/components/klara/klara-matching-screen";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";

export default function CounsellorKlaraScreen() {
  return (
    <CounsellorScreenShell
      title="Ask Klara"
      subtitle="AI counsellor for school partners"
    >
      <KlaraMatchingScreen subtitle="Ask about Germany pathways for your students." />
    </CounsellorScreenShell>
  );
}
