import { Linking, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { CounsellorScroll, SectionCard } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { getApiBaseUrl } from "@/lib/config/public-env";

export default function TrainingModuleScreen() {
  const { title, moduleId } = useLocalSearchParams<{
    title?: string;
    moduleId?: string;
  }>();

  return (
    <CounsellorScreenShell title={title ?? "Training module"} subtitle={moduleId}>
      <CounsellorScroll>
        <SectionCard
          title="Module content"
          subtitle="Open training materials on the web or mark complete from the module list."
        >
          <Text className="mt-2 text-sm text-muted">
            Video and document content mirrors the web counsellor portal for this module.
          </Text>
          <GradientButton
            text="Open on web"
            className="mt-4"
            onPress={() => {
              void Linking.openURL(`${getApiBaseUrl()}/agent/training`);
            }}
          />
        </SectionCard>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
