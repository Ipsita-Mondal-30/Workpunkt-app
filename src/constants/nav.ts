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
    { label: "Home", href: "/(counsellor)" },
    { label: "Career Pathing", href: "/(counsellor)/career-pathing" },
    { label: "Roadmaps", href: "/(counsellor)/roadmaps" },
    { label: "CP Resources", href: "/(counsellor)/cp-resources" },
    { label: "Quota", href: "/(counsellor)/quota" },
    { label: "Prospects", href: "/(counsellor)/prospects" },
    { label: "Rewards", href: "/(counsellor)/rewards" },
    { label: "My Students", href: "/(counsellor)/students" },
    { label: "Student Programs", href: "/(counsellor)/student-programs" },
    { label: "Resources", href: "/(counsellor)/resources" },
    { label: "Ask Klara", href: "/(counsellor)/klara" },
    { label: "Message Team", href: "/(counsellor)/message-team" },
    { label: "Settings", href: "/(counsellor)/settings" },
  ],
};

export const ROLE_TITLE: Record<AppRole, string> = {
  student: "Student",
  admin: "Admin",
  agent: "Agent",
  counsellor: "School Counsellor",
};
