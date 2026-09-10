import { useState } from "react";
import { Alert, Text, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { CounsellorScroll, SectionCard } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { authFetch } from "@/lib/api/auth-fetch";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function RoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { careerPathing, refresh } = useCounsellorContext();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const roadmap = careerPathing?.roadmaps.find((item) => item.id === id);

  async function saveRoadmap() {
    if (!roadmap?.roadmap_json) {
      Alert.alert("Unavailable", "This roadmap has no editable content yet.");
      return;
    }

    setSaving(true);
    try {
      const roadmapJson = {
        ...(roadmap.roadmap_json as Record<string, unknown>),
        counsellorNotes:
          notes.trim() ||
          (roadmap.roadmap_json as { counsellorNotes?: string }).counsellorNotes,
      };

      const response = await authFetch("/api/agent/career-pathing/roadmaps/update", {
        method: "POST",
        body: JSON.stringify({ roadmapId: roadmap.id, roadmapJson }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? "Could not save roadmap.");
      }
      await refresh();
      Alert.alert("Saved", "Roadmap updated.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not save roadmap.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!roadmap) {
    return (
      <CounsellorScreenShell title="Roadmap">
        <CounsellorScroll>
          <Text className="text-sm text-muted">Roadmap not found.</Text>
        </CounsellorScroll>
      </CounsellorScreenShell>
    );
  }

  const grades = Array.isArray((roadmap.roadmap_json as { grades?: unknown[] })?.grades)
    ? ((roadmap.roadmap_json as {
        grades: Array<{ grade?: number; label?: string; tasks?: string[] }>;
      }).grades)
    : [];

  return (
    <CounsellorScreenShell title={roadmap.student_name} subtitle="Customize approved roadmap">
      <CounsellorScroll>
        {grades.map((grade, index) => (
          <SectionCard
            key={`${grade.grade ?? index}`}
            title={grade.label ?? `Grade ${grade.grade ?? index + 1}`}
            subtitle={(grade.tasks ?? []).join(" · ") || "No tasks listed"}
          />
        ))}

        <SectionCard title="Counsellor notes">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes for this roadmap"
            placeholderTextColor="#94a3b8"
            multiline
            className="mt-2 min-h-[120px] rounded-2xl border border-border bg-bg px-4 py-3 text-base text-text"
          />
          <GradientButton
            text="Save changes"
            loading={saving}
            className="mt-4"
            onPress={() => void saveRoadmap()}
          />
        </SectionCard>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
