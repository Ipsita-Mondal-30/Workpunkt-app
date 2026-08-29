import type { Href } from "expo-router";

/** Map website `next` query values to Expo auth routes. */
export function mapAuthNextPath(next: string | null | undefined): Href {
  const value = (next ?? "").trim();

  if (
    value.startsWith("/private/application/academic") ||
    value.includes("private/application/academic")
  ) {
    return "/(auth)/signup/student/academic";
  }

  if (
    value.startsWith("/private/application/upload") ||
    value.includes("private/application/upload")
  ) {
    return "/(auth)/signup/student/upload";
  }

  if (value.startsWith("/welcome") || value.includes("/welcome")) {
    return "/(auth)/welcome";
  }

  if (value.startsWith("/onboarding") || value.includes("/onboarding")) {
    return "/(auth)/onboarding";
  }

  if (value.startsWith("/agent") || value.includes("agent/dashboard")) {
    return "/(agent)";
  }

  return "/(auth)/login";
}

export function parseAuthLinkUrl(url: string): {
  kind: "email-link" | "confirm" | "activate" | "unknown";
  tokenHash?: string;
  type?: string;
  next?: string;
  token?: string;
} {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, "") || "/";

    if (path.endsWith("/auth/email-link") || path.includes("/auth/email-link")) {
      return {
        kind: "email-link",
        tokenHash: parsed.searchParams.get("token_hash") ?? undefined,
        type: parsed.searchParams.get("type") ?? undefined,
        next: parsed.searchParams.get("next") ?? undefined,
      };
    }

    if (path.endsWith("/auth/confirm") || path.includes("/auth/confirm")) {
      return {
        kind: "confirm",
        tokenHash: parsed.searchParams.get("token_hash") ?? undefined,
        type: parsed.searchParams.get("type") ?? undefined,
        next: parsed.searchParams.get("next") ?? undefined,
      };
    }

    if (path.endsWith("/agent/activate") || path.includes("/agent/activate")) {
      return {
        kind: "activate",
        token: parsed.searchParams.get("token") ?? undefined,
      };
    }
  } catch {
    // ignore
  }

  return { kind: "unknown" };
}

/**
 * Website signup returns a same-origin continue path such as
 * `/auth/confirm?token_hash=…&type=magiclink&next=/private/application/academic`.
 */
export function parseSignupContinueUrl(continueUrl: string | null | undefined) {
  const value = continueUrl?.trim() ?? "";
  if (!value.startsWith("/")) return { kind: "unknown" as const };

  return parseAuthLinkUrl(`https://workpunkt.com${value}`);
}
