import { supabase } from "@/lib/supabase/client";
import { formatApiNetworkError, getApiBaseUrl } from "@/lib/config/public-env";

export async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Fetch wrapper that sends the Supabase access token to the Next.js API.
 */
export async function authFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken();

  if (!token) {
    console.error("[authFetch] Not authenticated", { path });
    throw new Error("Not authenticated");
  }

  const apiBase = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  console.log("[authFetch]", init?.method ?? "GET", url);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      console.error("[authFetch] error", {
        url,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response;
  } catch (error) {
    const message = formatApiNetworkError(error, apiBase);
    console.error("[authFetch] network failure", { url, message, error });
    throw new Error(message);
  }
}
