/**
 * Normalized public env values for Expo.
 */
export function getApiBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001").replace(
    /\/$/,
    "",
  );
}

export function getSignupUrl(): string {
  return (
    process.env.EXPO_PUBLIC_SIGNUP_URL?.trim() ||
    `${getApiBaseUrl()}/login`
  );
}

export function resolvePublicUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getApiBaseUrl()}${path}`;
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const signupPaths = {
  student: "/private/sign-up",
  schoolCounsellor: "/school-counsellor/apply",
  partner: "/agent/apply",
  login: "/login",
} as const;
