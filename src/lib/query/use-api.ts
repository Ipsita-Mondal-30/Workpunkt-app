import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { authFetch } from "@/lib/api/auth-fetch";
import {
  cacheOptions,
  type CachePolicy,
} from "@/lib/query/cache-policy";
import { invalidateQueryKeys } from "@/lib/query/invalidate";

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
  ok?: boolean;
};

export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authFetch(path, init);
  const json = (await response.json()) as ApiEnvelope<T> & T;

  if (!response.ok) {
    throw new Error(
      (json as ApiEnvelope<T>).error ?? `Request failed (${response.status})`,
    );
  }

  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    return json.data as T;
  }

  return json as T;
}

export async function postApiJson<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await authFetch(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json()) as ApiEnvelope<T> & T & {
    ok?: boolean;
    error?: string;
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

export function useApiQuery<T>(
  queryKey: QueryKey,
  path: string,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn"> & {
    cachePolicy?: CachePolicy;
  },
) {
  const { cachePolicy = "standard", ...queryOptions } = options ?? {};
  const policy = cacheOptions(cachePolicy);

  return useQuery<T, Error>({
    queryKey,
    queryFn: () => fetchApiJson<T>(path),
    staleTime: policy.staleTime,
    gcTime: policy.gcTime,
    refetchOnMount: policy.refetchOnMount,
    refetchOnWindowFocus: policy.refetchOnWindowFocus,
    refetchOnReconnect: policy.refetchOnReconnect,
    retry: policy.retry,
    ...queryOptions,
  });
}

export function useApiMutation<TBody, TResult = unknown>(
  path: string,
  invalidateKeys?: QueryKey[],
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (body: TBody) => postApiJson<TResult>(path, body),
    onSuccess: async () => {
      if (!invalidateKeys?.length) return;
      await invalidateQueryKeys(client, invalidateKeys);
    },
  });
}
