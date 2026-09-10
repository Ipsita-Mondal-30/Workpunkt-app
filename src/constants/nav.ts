import type { AppRole } from "@/lib/auth/resolve-role";

export type NavItem = {
  label: string;
  href: string;
};

export const ROLE_NAV: Record<AppRole, NavItem[]> = {
  student: [
    { label: "Home", href: "/(student)" },
    { label: "Matched Programs", href: "/(student)/matches" },
    { label: "Ask Klara", href: "/(student)/klara" },
    { label: "Settings", href: "/(student)/settings" },
  ],
  admin: [
    { label: "Home", href: "/(admin)" },
    { label: "Users / Leads", href: "/(admin)/leads" },
    { label: "Student Pipeline", href: "/(admin)/pipeline" },
    { label: "Applications Ops", href: "/(admin)/applications-ops" },
    { label: "Help & Chat", href: "/(admin)/help-chat" },
    { label: "Agents & Partners", href: "/(admin)/agents-partners" },
    { label: "Email Logs", href: "/(admin)/email-logs" },
    { label: "Settings", href: "/(admin)/settings" },
  ],
  agent: [
    { label: "Home", href: "/(agent)" },
    { label: "My Students", href: "/(agent)/students" },
    { label: "Student Programs", href: "/(agent)/student-programs" },
    { label: "Commissions", href: "/(agent)/commissions" },
    { label: "Payments", href: "/(agent)/payments" },
    { label: "Training", href: "/(agent)/training" },
    { label: "Resources", href: "/(agent)/resources" },
    { label: "Webinars", href: "/(agent)/webinars" },
    { label: "Ask Klara", href: "/(agent)/klara" },
    { label: "Message Team", href: "/(agent)/message-team" },
    { label: "Settings", href: "/(agent)/settings" },
  ],
  counsellor: [
    { label: "Dashboard", href: "/(counsellor)/(tabs)" },
    { label: "My Students", href: "/(counsellor)/(tabs)/students" },
    { label: "Student Programs", href: "/(counsellor)/(tabs)/more/student-programs" },
    { label: "Payments", href: "/(counsellor)/(tabs)/more/payments" },
    { label: "Training Hub", href: "/(counsellor)/(tabs)/training" },
    { label: "Resource Hub", href: "/(counsellor)/(tabs)/resources" },
    { label: "Ask Klara", href: "/(counsellor)/(tabs)/more/klara" },
    { label: "Message Team", href: "/(counsellor)/(tabs)/more/support" },
    { label: "Settings", href: "/(counsellor)/(tabs)/more/settings" },
  ],
};

/** Injected into counsellor drawer when Career Pathing is active (website sidebar parity). */
export const COUNSELLOR_CP_NAV: NavItem[] = [
  { label: "Career Pathing", href: "/(counsellor)/(tabs)/more/career-pathing" },
  { label: "Student Roadmaps", href: "/(counsellor)/(tabs)/more/roadmaps" },
  { label: "Quota & Prospects", href: "/(counsellor)/(tabs)/more/prospects" },
  { label: "Placement Rewards", href: "/(counsellor)/(tabs)/more/placement-rewards" },
];


export const ROLE_TITLE: Record<AppRole, string> = {
  student: "Student",
  admin: "Admin",
  agent: "Agent",
  counsellor: "School Counsellor",
};
