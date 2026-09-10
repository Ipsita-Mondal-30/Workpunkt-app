import { useMemo, useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import {
  CounsellorScroll,
  ListRow,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { LockedFeature } from "@/components/counsellor/locked-feature";
import { authFetch } from "@/lib/api/auth-fetch";
import type { AgentResource } from "@/lib/api/counsellor-types";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import { startMobileCheckout } from "@/lib/stripe/mobile-checkout";

export default function ResourcesScreen() {
  const { counsellorAccessPaid, careerPathing, refreshing, refresh } =
    useCounsellorContext();
  const [search, setSearch] = useState("");

  const resourcesQuery = useQuery({
    queryKey: ["counsellor", "resources"],
    queryFn: async () => {
      const response = await authFetch("/api/agent/resources");
      const json = (await response.json()) as {
        data?: { resources?: AgentResource[] };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load resources.");
      }
      return json.data?.resources ?? [];
    },
    enabled: counsellorAccessPaid,
  });

  const cpResources = careerPathing?.resources ?? [];

  const combined = useMemo(() => {
    const base = resourcesQuery.data ?? [];
    const cp = cpResources.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tag: item.tag ?? "Career Pathing",
      url: item.url,
    }));
    const merged = [...base, ...cp];
    const q = search.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tag?.toLowerCase().includes(q),
    );
  }, [resourcesQuery.data, cpResources, search]);

  if (!counsellorAccessPaid) {
    return (
      <LockedFeature
        title="Resource library"
        description="Counselor Access unlocks guides, videos, and documents for school counsellors."
        productType="school_counsellor_access"
        onUpgrade={() =>
          void startMobileCheckout("school_counsellor_access").then(() => refresh())
        }
      />
    );
  }

  return (
    <CounsellorScreenShell
      title="Resources"
      subtitle="Guides and files for school counsellors"
    >
      <CounsellorScroll
        loading={resourcesQuery.isLoading}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        error={resourcesQuery.error instanceof Error ? resourcesQuery.error.message : null}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search resources"
          placeholderTextColor="#94a3b8"
          className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text"
        />

        {combined.length === 0 ? (
          <Text className="text-sm text-muted">No resources available.</Text>
        ) : (
          combined.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.description}
              badge={item.tag}
              onPress={
                item.url
                  ? () => void Linking.openURL(item.url!)
                  : undefined
              }
            />
          ))
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
