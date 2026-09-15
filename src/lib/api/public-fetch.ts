import { formatApiNetworkError, getApiBaseUrl } from "@/lib/config/public-env";

/** Unauthenticated fetch to the Workpunkt Next.js API (signup / apply). */
export async function publicFetch(path: string, init?: RequestInit): Promise<Response> {
  const apiBase = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  try {
    return await fetch(url, {
      ...init,
      headers,
    });
  } catch (error) {
    const message = formatApiNetworkError(error, apiBase);
    console.error("[publicFetch] network failure", { url, message, error });
    throw new Error(message);
  }
}

export async function publicPostJson<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await publicFetch(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json()) as T & {
    ok?: boolean;
    error?: string;
    data?: T;
  };

  if (!response.ok || (json && typeof json === "object" && json.ok === false)) {
    throw new Error(
      (json as { error?: string }).error ?? `Request failed (${response.status})`,
    );
  }

  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    return json.data as T;
  }

  return json as T;
}
