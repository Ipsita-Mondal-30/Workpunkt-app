import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";

import {
  ActionTile,
  LoadingCards,
  PageHeading,
  PortalHero,
  PortalPage,
  type PortalIconName,
} from "@/components/portal/portal-ui";
import { StatsRow, type StatCard } from "@/components/shared/stats-row";
import { useAuth } from "@/lib/auth/auth-context";
import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import { useThemeColors } from "@/lib/theme/theme-context";

const PAGE_GUTTER = 20;
const CARD_GAP = 12;
/** Keep enough of the next card visible on every phone width. */
const NEXT_PEEK = 40;

const SECTIONS: Array<{
  title: string;
  description: string;
  icon: PortalIconName;
  href: "/(admin)/leads" | "/(admin)/pipeline" | "/(admin)/applications-ops" | "/(admin)/help-chat" | "/(admin)/agents-partners" | "/(admin)/email-logs";
}> = [
  {
    title: "Users & leads",
    description: "Review enquiries and move students forward",
    icon: "people",
    href: "/(admin)/leads",
  },
  {
    title: "Student pipeline",
    description: "Track matching, documents and placement",
    icon: "target",
    href: "/(admin)/pipeline",
  },
  {
    title: "Applications",
    description: "Manage submissions and university decisions",
    icon: "file",
    href: "/(admin)/applications-ops",
  },
  {
    title: "Help & conversations",
    description: "Keep students and partners supported",
    icon: "chat",
    href: "/(admin)/help-chat",
  },
  {
    title: "Agents & partners",
    description: "Review applications and partner access",
    icon: "people",
    href: "/(admin)/agents-partners",
  },
  {
    title: "Email centre",
    description: "Delivery updates and recipient recovery",
    icon: "bell",
    href: "/(admin)/email-logs",
  },
];

type CommandStat = {
  id: string;
  value: string;
  label: string;
  trend: string;
  href: string;
  color: string;
};

type AttentionItem = {
  id: string;
  title: string;
  subtitle: string;
  action: string;
  actionHref: string;
  tone: string;
};

type CommandCentreData = {
  meta: {
    dateBanner: string;
    subtitle: string;
  };
  stats: CommandStat[];
  attention: AttentionItem[];
  pipeline: {
    activeCount: number;
  };
};

const WEB_TO_APP_HREF: Record<string, string> = {
  "/admin/dashboard": "/(admin)",
  "/admin/users-leads": "/(admin)/leads",
  "/admin/student-pipeline": "/(admin)/pipeline",
  "/admin/applications-ops": "/(admin)/applications-ops",
  "/admin/help-chat": "/(admin)/help-chat",
  "/admin/agents-partners": "/(admin)/agents-partners",
  "/admin/email-logs": "/(admin)/email-logs",
};

function mapWebHref(href: string): string | null {
  if (WEB_TO_APP_HREF[href]) return WEB_TO_APP_HREF[href];
  const match = Object.entries(WEB_TO_APP_HREF).find(([web]) => href.startsWith(web));
  return match?.[1] ?? null;
}

function mapStatColor(color: string): StatCard["color"] {
  if (color === "pink" || color === "magenta") return "pink";
  if (color === "blue" || color === "teal" || color === "info") return "blue";
  if (color === "green") return "green";
  return "purple";
}

function buildStats(data: CommandCentreData): StatCard[] {
  return data.stats.slice(0, 6).map((stat) => ({
    id: stat.id,
    value: stat.value,
    label: stat.label,
    sub: stat.trend,
    color: mapStatColor(stat.color),
  }));
}

export default function AdminHome() {
  const { profile } = useAuth();
  const colors = useThemeColors();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const query = useApiQuery<CommandCentreData>(
    queryKeys.adminCommandCentre(),
    "/api/admin/command-centre",
    { cachePolicy: "heavy" },
  );

  const cardWidth = Math.max(240, windowWidth - PAGE_GUTTER - NEXT_PEEK);
  const data = query.data;
  const textColor = colors.text;
  const mutedColor = colors.muted;
  const surfaceBg = colors.surface;
  const borderColor = colors.border;

  return (
    <PortalPage
      refreshing={query.isRefetching && !query.isLoading}
      onRefresh={() => void query.refetch()}
    >
      <PageHeading
        title="Operations overview"
        eyebrow="WORKPUNKT ADMIN"
        subtitle={
          data?.meta.subtitle ||
          "Every student journey. One place to keep things moving."
        }
      />

      <PortalHero
        eyebrow="YOUR DAILY WORKSPACE"
        title={`Welcome back${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.`}
        description={
          data?.meta.dateBanner
            ? data.meta.dateBanner
            : "Review new enquiries, follow up on applications and stay connected with the people behind every next step."
        }
      />

      {query.isLoading && !data ? <LoadingCards /> : null}

      {query.error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{query.error.message}</Text>
          <Pressable onPress={() => void query.refetch()} className="mt-2">
            <Text className="text-sm font-semibold text-brand-mid">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {data ? <StatsRow stats={buildStats(data)} scrollable /> : null}

      {data?.attention?.length ? (
        <View style={{ marginBottom: 24, gap: 8 }}>
          <Text
            accessibilityRole="header"
            style={{ marginBottom: 4, fontSize: 18, fontWeight: "700", color: textColor }}
          >
            Needs attention
          </Text>
          {data.attention.slice(0, 3).map((item) => {
            const href = mapWebHref(item.actionHref);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                disabled={!href}
                onPress={() => {
                  if (href) router.push(href as never);
                }}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: surfaceBg,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: textColor }}>
                  {item.title}
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, lineHeight: 18, color: mutedColor }}>
                  {item.subtitle}
                </Text>
                {href ? (
                  <Text style={{ marginTop: 8, fontSize: 12, fontWeight: "600", color: "#f6339a" }}>
                    {item.action} →
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Text
        accessibilityRole="header"
        style={{ marginBottom: 8, fontSize: 18, fontWeight: "700", color: textColor }}
      >
        Manage your workspace
      </Text>
      <Text style={{ marginBottom: 16, fontSize: 14, lineHeight: 20, color: mutedColor }}>
        Swipe to browse modules
        {data?.pipeline?.activeCount != null
          ? ` · ${data.pipeline.activeCount} active students in pipeline`
          : ""}
        .
      </Text>

      <View style={{ marginHorizontal: -PAGE_GUTTER, marginBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth + CARD_GAP}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={{
            paddingHorizontal: PAGE_GUTTER,
            gap: CARD_GAP,
            paddingBottom: 4,
          }}
        >
          {SECTIONS.map((item) => (
            <ActionTile
              key={item.href}
              variant="rail"
              width={cardWidth}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onPress={() => router.push(item.href)}
            />
          ))}
        </ScrollView>
      </View>
    </PortalPage>
  );
}
