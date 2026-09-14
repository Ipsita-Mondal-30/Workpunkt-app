import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ActionTile, PageHeading, PortalHero, PortalPage } from "@/components/portal/portal-ui";
import { useAuth } from "@/lib/auth/auth-context";

const SECTIONS = [
  { title: "Users & leads", description: "Review enquiries and move students forward", icon: "people", href: "/(admin)/leads" },
  { title: "Student pipeline", description: "Track matching, documents and placement", icon: "target", href: "/(admin)/pipeline" },
  { title: "Applications", description: "Manage submissions and university decisions", icon: "file", href: "/(admin)/applications-ops" },
  { title: "Help & conversations", description: "Keep students and partners supported", icon: "chat", href: "/(admin)/help-chat" },
  { title: "Agents & partners", description: "Review applications and partner access", icon: "people", href: "/(admin)/agents-partners" },
  { title: "Email centre", description: "Delivery updates and recipient recovery", icon: "bell", href: "/(admin)/email-logs" },
] as const;

export default function AdminHome() {
  const { profile } = useAuth();
  const router = useRouter();
  return <PortalPage><PageHeading title="Operations overview" eyebrow="WORKPUNKT ADMIN" subtitle="Every student journey. One place to keep things moving." /><PortalHero eyebrow="YOUR DAILY WORKSPACE" title={`Welcome back${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.`} description="Review new enquiries, follow up on applications and stay connected with the people behind every next step." /><Text accessibilityRole="header" className="mb-4 text-lg font-bold text-text">Manage your workspace</Text><View className="flex-row flex-wrap gap-3">{SECTIONS.map((item) => <ActionTile key={item.href} title={item.title} description={item.description} icon={item.icon} onPress={() => router.push(item.href as never)} />)}</View></PortalPage>;
}
