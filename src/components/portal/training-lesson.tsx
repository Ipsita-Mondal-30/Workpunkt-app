import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EmptyState, LoadingCards, PageHeading, PortalCard, PortalHero, PortalIcon, PortalPage, ProgressBar } from "@/components/portal/portal-ui";
import { GradientButton } from "@/components/shared/gradient-button";
import { openExternalUrl } from "@/lib/open-external-url";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation, useApiQuery } from "@/lib/query/use-api";

type TrainingModule = {
  id: string;
  title: string;
  description?: string;
  bodyText?: string;
  status?: "completed" | "available" | "locked" | "agent_only" | "optional";
  contentUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  watchedPercent?: number;
  completedAt?: string;
};
type TrainingHub = { mandatoryModules?: TrainingModule[]; optionalModules?: TrainingModule[] };

export function TrainingLesson({ role = "agent" }: { role?: "agent" | "counsellor" }) {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const router = useRouter();
  const query = useApiQuery<TrainingHub>(role === "agent" ? queryKeys.agentTraining() : ["counsellor", "training"], "/api/agent/training");
  const progress = useApiMutation<Record<string, unknown>, unknown>("/api/agent/training/progress", [queryKeys.agentTraining(), ["counsellor", "training"]]);
  const modules = [...(query.data?.mandatoryModules ?? []), ...(query.data?.optionalModules ?? [])];
  const lesson = modules.find((item) => item.id === moduleId);
  const complete = lesson?.status === "completed" || Boolean(lesson?.completedAt) || (progress.isSuccess && progress.variables?.moduleId === lesson?.id);
  const locked = lesson?.status === "locked" || (role === "counsellor" && lesson?.status === "agent_only");
  const percent = complete ? 100 : Math.min(100, Math.max(0, lesson?.watchedPercent ?? 0));

  return (
    <PortalPage refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} className="mb-5 min-h-11 flex-row items-center gap-2 self-start rounded-full border border-border bg-surface px-4">
        <PortalIcon name="back" size={16} /><Text className="text-sm font-semibold text-text">Back to training</Text>
      </Pressable>
      {query.isLoading && !query.data ? <LoadingCards /> : query.error && !query.data ? (
        <EmptyState icon="book" title="Training couldn't load" description={query.error.message} action={<GradientButton text="Try again" onPress={() => void query.refetch()} />} />
      ) : !lesson ? (
        <EmptyState icon="book" title="Module unavailable" description="This module may no longer be available for your account. Return to training to see your current modules." />
      ) : (
        <>
          <PageHeading eyebrow="WORKPUNKT ACADEMY" title={lesson.title} subtitle={lesson.description} />
          {query.error ? <Text accessibilityRole="alert" className="mb-4 text-sm text-error">Showing saved content. Refresh failed: {query.error.message}</Text> : null}
          <PortalHero eyebrow={locked ? "NOT YET AVAILABLE" : complete ? "COMPLETED" : "YOUR LEARNING JOURNEY"} title={locked ? "Your next step is waiting." : complete ? "One step further." : "Build your expertise."}
            description={locked ? "Complete the required earlier modules or check your account access to unlock this lesson." : complete ? "You've marked this module complete. You can revisit the materials whenever you need." : "Read the lesson, explore the resources, then save your progress."}>
            {!locked ? <View className="gap-3"><View className="flex-row justify-between"><Text className="text-xs font-semibold text-text">Module progress</Text><Text className="text-xs font-bold text-brand-start">{Math.round(percent)}%</Text></View><ProgressBar value={percent} label="Module completion" /></View> : null}
          </PortalHero>
          {!locked ? (
            <View className="flex-row flex-wrap gap-5">
              <View style={{ flexBasis: 380, flexGrow: 2, flexShrink: 1 }}>
                {lesson.bodyText ? <PortalCard title="In this lesson"><Text className="mt-4 text-base leading-7 text-text">{lesson.bodyText}</Text></PortalCard> : null}
                {lesson.contentUrl ? <PortalCard>
                  <View className="items-center rounded-2xl bg-brand-start/5 px-5 py-8">
                    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-brand-start/10"><PortalIcon name="play" size={28} /></View>
                    <Text className="text-center text-lg font-bold text-text">Your training material</Text>
                    <Text className="mt-2 text-center text-sm leading-6 text-muted">Open the lesson content in your browser, then return here to save your progress.</Text>
                    <GradientButton className="mt-5" text="Open lesson content" onPress={() => void openExternalUrl(lesson.contentUrl!)} />
                  </View>
                </PortalCard> : null}
                {!lesson.bodyText && !lesson.contentUrl ? <EmptyState icon="book" title="Materials are being prepared" description="No lesson content has been published here yet. Check back later or contact your Workpunkt team." /> : null}
              </View>
              <View style={{ flexBasis: 240, flexGrow: 1, flexShrink: 1 }}>
                <PortalCard title="Lesson resources">
                  {lesson.linkUrl ? <Pressable accessibilityRole="link" onPress={() => void openExternalUrl(lesson.linkUrl!)} className="mt-4 min-h-12 flex-row items-center gap-3 rounded-2xl border border-border bg-surface-end p-4"><PortalIcon name="file" /><Text className="flex-1 text-sm font-semibold text-text">{lesson.linkLabel || "Open resource"}</Text><PortalIcon name="arrow" size={16} /></Pressable> : <Text className="mt-3 text-sm leading-6 text-muted">No additional resources for this lesson.</Text>}
                </PortalCard>
                <PortalCard title={complete ? "Progress saved" : "Finished this lesson?"}>
                  <Text className="mt-3 text-sm leading-6 text-muted">{complete ? "Your completion is recorded. Continue with the next available module from the training hub." : "Once you have reviewed the material, mark this lesson as complete."}</Text>
                  {progress.error ? <Text accessibilityRole="alert" className="mt-3 text-sm text-error">{progress.error.message}</Text> : null}
                  {complete ? <View accessibilityLiveRegion="polite" className="mt-4 flex-row items-center gap-2 rounded-2xl bg-success/10 p-4"><PortalIcon name="check" color="#16a34a" /><Text className="font-semibold text-success">Module completed</Text></View> : <GradientButton className="mt-5" text="Mark as complete" loading={progress.isPending} onPress={() => progress.mutate(role === "counsellor" ? { moduleId: lesson.id, completed: true } : { moduleId: lesson.id, mediaId: "__module__", currentTime: 1, duration: 1, ended: true })} />}
                </PortalCard>
              </View>
            </View>
          ) : null}
        </>
      )}
    </PortalPage>
  );
}
