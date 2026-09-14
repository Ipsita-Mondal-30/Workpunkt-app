import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { TrainingLesson } from "@/components/portal/training-lesson";

export default function TrainingModuleScreen() {
  return <CounsellorScreenShell><TrainingLesson role="counsellor" /></CounsellorScreenShell>;
}
