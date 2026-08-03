import { KlaraMatchingScreen } from "@/components/klara/klara-matching-screen";

export default function StudentKlaraScreen() {
  return (
    <KlaraMatchingScreen
      subtitle="Your AI counsellor — chat and free program matching"
      requireStudentTarget={false}
    />
  );
}
