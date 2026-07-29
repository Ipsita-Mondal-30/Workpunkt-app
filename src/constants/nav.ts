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
    { label: "Student Pipeline", href: "/(admin)/pipeline" },
    { label: "Users / Leads", href: "/(admin)/leads" },
    { label: "Settings", href: "/(admin)/settings" },
  ],
  agent: [
    { label: "Home", href: "/(agent)" },
    { label: "My Students", href: "/(agent)/students" },
    { label: "Ask Klara", href: "/(agent)/klara" },
    { label: "Settings", href: "/(agent)/settings" },
  ],
  counsellor: [
    { label: "Home", href: "/(counsellor)" },
    { label: "Resources", href: "/(counsellor)/resources" },
    { label: "Ask Klara", href: "/(counsellor)/klara" },
    { label: "Settings", href: "/(counsellor)/settings" },
  ],
};

export const ROLE_TITLE: Record<AppRole, string> = {
  student: "Student",
  admin: "Admin",
  agent: "Agent",
  counsellor: "School Counsellor",
};
