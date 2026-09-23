import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Normalized public env values for Expo.
 *
 * In __DEV__, rewrite localhost / stale LAN hosts to the Expo Metro LAN IP so
 * physical Android/iOS devices can reach the Workpunkt Next.js API.
 */

function configuredApiUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? "https://www.workpunkt.com").replace(
    /\/$/,
    "",
  );
}

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  );
}

function isPrivateLanHost(hostname: string): boolean {
  if (isLoopbackHost(hostname)) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)) return true;
  return false;
}

/** Host the phone/emulator uses to reach this machine (from Expo). */
export function getExpoDevLanHost(): string | null {
  const candidates: Array<string | null | undefined> = [
    Constants.expoConfig?.hostUri,
    // Expo Go / legacy manifests
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig
      ?.debuggerHost,
    (
      Constants as {
        manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
      }
    ).manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as { manifest?: { debuggerHost?: string } }).manifest
      ?.debuggerHost,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "string") continue;
    const host = candidate.split(":")[0]?.replace(/^\[|\]$/g, "").trim();
    if (host && !isLoopbackHost(host)) return host;
  }

  return null;
}

/**
 * API origin used by authFetch / publicFetch / deep links.
 * Dev builds prefer the live Expo LAN host over a stale .env IP.
 */
export function getApiBaseUrl(): string {
  const configured = configuredApiUrl();

  if (typeof __DEV__ === "undefined" || !__DEV__) {
    return configured;
  }

  try {
    const url = new URL(configured);
    const lanHost = getExpoDevLanHost();

    if (isLoopbackHost(url.hostname)) {
      if (lanHost) {
        url.hostname = lanHost;
      } else if (Platform.OS === "android") {
        // Android emulator loopback alias for the host machine.
        url.hostname = "10.0.2.2";
      }
      return url.toString().replace(/\/$/, "");
    }

    // .env often hardcodes yesterday's Wi‑Fi IP — rewrite to Expo's current host.
    if (lanHost && isPrivateLanHost(url.hostname) && url.hostname !== lanHost) {
      url.hostname = lanHost;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // Fall through to configured URL.
  }

  return configured;
}

export function getSignupUrl(): string {
  const configured = process.env.EXPO_PUBLIC_SIGNUP_URL?.trim();
  if (configured) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      try {
        const url = new URL(configured);
        const api = new URL(getApiBaseUrl());
        if (isPrivateLanHost(url.hostname) && url.hostname !== api.hostname) {
          url.hostname = api.hostname;
          return url.toString().replace(/\/$/, "");
        }
      } catch {
        // keep configured
      }
    }
    return configured.replace(/\/$/, "");
  }
  return `${getApiBaseUrl()}/login`;
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

export function formatApiNetworkError(error: unknown, baseUrl = getApiBaseUrl()): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Network request failed";

  const lower = raw.toLowerCase();
  if (
    lower.includes("network request failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("host unreachable") ||
    lower.includes("noroutetohost") ||
    lower.includes("econnrefused") ||
    lower.includes("timed out")
  ) {
    return (
      `Cannot reach Workpunkt API at ${baseUrl}. ` +
      "Start the WORKPUNKT server, join the same Wi‑Fi as this device, " +
      "set EXPO_PUBLIC_API_URL to that machine (port), then restart Expo with cache clear."
    );
  }

  return raw;
}

export const signupPaths = {
  student: "/private/sign-up",
  schoolCounsellor: "/school-counsellor/apply",
  partner: "/agent/apply",
  login: "/login",
} as const;
