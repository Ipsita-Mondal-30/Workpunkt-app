export type AppRole = "admin" | "agent" | "counsellor" | "student";

export type ProfileFlags = {
  role: string | null;
  admin_role: string | null;
  name: string | null;
  email: string | null;
  is_agent_active: boolean | null;
  is_enrolled: boolean | null;
  needs_password_setup: boolean | null;
};

/** Mirror website post-login priority: admin → counsellor → agent → student. */
export function resolveAppRole(profile: ProfileFlags | null): AppRole {
  if (profile?.admin_role) {
    return "admin";
  }

  if (profile?.role === "school_counsellor") {
    return "counsellor";
  }

  if (profile?.role === "agent") {
    return "agent";
  }

  return "student";
}

export function roleHomePath(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/(admin)";
    case "agent":
      return "/(agent)";
    case "counsellor":
      return "/(counsellor)";
    case "student":
    default:
      return "/(student)";
  }
}
