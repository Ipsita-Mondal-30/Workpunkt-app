const apiBase = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

/** Unauthenticated fetch to the Workpunkt Next.js API (signup / apply). */
export async function publicFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    headers,
  });
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
