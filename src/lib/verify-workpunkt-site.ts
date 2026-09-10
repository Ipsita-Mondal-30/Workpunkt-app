import { getApiBaseUrl } from "@/lib/config/public-env";

/** Detect whether the configured API host is the Workpunkt site (not another app on the same port). */
export async function verifyWorkpunktSite(): Promise<{
  ok: boolean;
  message?: string;
}> {
  const base = getApiBaseUrl();

  try {
    const response = await fetch(`${base}/login`, {
      method: "GET",
      headers: { Accept: "text/html" },
    });

    const html = await response.text();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() ?? "";

    if (title.toLowerCase().includes("workpunkt")) {
      return { ok: true };
    }

    if (title && !title.toLowerCase().includes("workpunkt")) {
      const port = new URL(base).port || "80";
      return {
        ok: false,
        message:
          port === "3000"
            ? 'Port 3000 is serving another app (not Workpunkt). Run "PORT=3001 npm run dev" in WORKPUNKT, set EXPO_PUBLIC_API_URL to port 3001, then restart Expo with "npx expo start -c".'
            : `Port ${port} is serving "${title}", not Workpunkt. Update EXPO_PUBLIC_API_URL in .env and restart Expo.`,
      };
    }

    const applyProbe = await fetch(`${base}/school-counsellor/apply`, {
      method: "HEAD",
    });

    if (applyProbe.ok) {
      return { ok: true };
    }

    return {
      ok: false,
      message: `Could not reach Workpunkt at ${base}. Start the WORKPUNKT dev server and point EXPO_PUBLIC_API_URL to it.`,
    };
  } catch {
    return {
      ok: false,
      message: `Could not connect to ${base}. Ensure WORKPUNKT is running and your phone is on the same network.`,
    };
  }
}
