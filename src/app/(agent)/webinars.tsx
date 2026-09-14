import { Pressable, Text, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { openExternalUrl } from "@/lib/open-external-url";
import { queryKeys } from "@/lib/query/keys";

type AgentFeaturedWebinar = {
  id: string;
  badge: string;
  title: string;
  description: string;
  date: string;
  time: string;
  host: string;
  registeredCount: number;
  registrationUrl?: string;
  joinUrl?: string;
  url?: string;
};

type AgentFutureWebinar = {
  id: string;
  title: string;
  date: string;
  time: string;
  registeredCount: number;
  status: string;
  registrationUrl?: string;
  joinUrl?: string;
  url?: string;
};

type AgentPastRecording = {
  id: string;
  title: string;
  description: string | null;
  durationLabel: string;
  dateLabel: string;
  hostName: string | null;
  playbackUrl?: string;
  url?: string;
};

type AgentWebinarsData = {
  featured: AgentFeaturedWebinar | null;
  futureWebinars: AgentFutureWebinar[];
  pastRecordings: AgentPastRecording[];
  newsletters: Array<{
    id: string;
    month: string;
    description: string;
    isLatest: boolean;
    url?: string;
    downloadUrl?: string;
  }>;
};

export default function AgentWebinarsScreen() {
  return (
    <ResourceScreen<AgentWebinarsData>
      title="Webinars"
      subtitle="Live sessions, recordings, and newsletters"
      queryKey={queryKeys.agentWebinars()}
      path="/api/agent/webinars"
    >
      {(data) => (
        <>
          {data.featured ? (
            <Pressable disabled={!data.featured.joinUrl && !data.featured.registrationUrl && !data.featured.url} onPress={() => void openExternalUrl(data.featured!.joinUrl || data.featured!.registrationUrl || data.featured!.url || "")} className="mb-4 rounded-2xl border border-brand-mid/30 bg-surface px-4 py-4">
              <Text className="text-xs font-semibold uppercase text-brand-mid">
                {data.featured.badge}
              </Text>
              <Text className="mt-1 text-lg font-bold text-text">{data.featured.title}</Text>
              <Text className="mt-2 text-sm text-muted">{data.featured.description}</Text>
              <Text className="mt-2 text-xs text-muted">
                {data.featured.date} · {data.featured.time} · {data.featured.host}
              </Text>
              <Text className="mt-1 text-xs text-brand-mid">
                {data.featured.registeredCount} registered
              </Text>
              {data.featured.joinUrl || data.featured.registrationUrl || data.featured.url ? <Text className="mt-3 text-xs font-bold text-brand-mid">{data.featured.joinUrl ? "Join webinar" : "Register now"} →</Text> : null}
            </Pressable>
          ) : null}

          {data.futureWebinars.length > 0 ? (
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-text">Upcoming</Text>
              <View className="gap-2">
                {data.futureWebinars.map((webinar) => (
                  <Pressable
                    key={webinar.id}
                    disabled={!webinar.joinUrl && !webinar.registrationUrl && !webinar.url}
                    onPress={() => void openExternalUrl(webinar.joinUrl || webinar.registrationUrl || webinar.url || "")}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-text">{webinar.title}</Text>
                    <Text className="mt-1 text-xs text-muted">
                      {webinar.date} · {webinar.time}
                    </Text>
                    <Text className="mt-1 text-xs uppercase text-brand-mid">
                      {webinar.status} · {webinar.registeredCount} registered
                    </Text>
                    {webinar.joinUrl || webinar.registrationUrl || webinar.url ? <Text className="mt-2 text-xs font-bold text-brand-mid">{webinar.joinUrl ? "Join" : "View details"} →</Text> : null}
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {data.pastRecordings.length > 0 ? (
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-text">Recordings</Text>
              <View className="gap-2">
                {data.pastRecordings.map((recording) => (
                  <Pressable
                    key={recording.id}
                    disabled={!recording.playbackUrl && !recording.url}
                    onPress={() => void openExternalUrl(recording.playbackUrl || recording.url || "")}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-text">{recording.title}</Text>
                    {recording.description ? (
                      <Text className="mt-1 text-xs text-muted" numberOfLines={2}>
                        {recording.description}
                      </Text>
                    ) : null}
                    <Text className="mt-1 text-xs text-muted">
                      {recording.durationLabel} · {recording.dateLabel}
                      {recording.hostName ? ` · ${recording.hostName}` : ""}
                    </Text>
                    {recording.playbackUrl || recording.url ? <Text className="mt-2 text-xs font-bold text-brand-mid">Watch recording →</Text> : null}
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {data.newsletters.length > 0 ? (
            <View>
              <Text className="mb-2 text-sm font-semibold text-text">Newsletters</Text>
              <View className="gap-2">
                {data.newsletters.map((issue) => (
                  <Pressable
                    key={issue.id}
                    disabled={!issue.url && !issue.downloadUrl}
                    onPress={() => void openExternalUrl(issue.url || issue.downloadUrl || "")}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-text">{issue.month}</Text>
                    <Text className="mt-1 text-xs text-muted">{issue.description}</Text>
                    {issue.isLatest ? (
                      <Text className="mt-1 text-xs font-semibold uppercase text-brand-mid">
                        Latest
                      </Text>
                    ) : null}
                    {issue.url || issue.downloadUrl ? <Text className="mt-2 text-xs font-bold text-brand-mid">Read newsletter →</Text> : null}
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {!data.featured &&
          data.futureWebinars.length === 0 &&
          data.pastRecordings.length === 0 &&
          data.newsletters.length === 0 ? (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">No webinars or newsletters yet.</Text>
            </View>
          ) : null}
        </>
      )}
    </ResourceScreen>
  );
}
