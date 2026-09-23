import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";

const REFETCH = { refetchType: "active" as const };

/** Invalidate every query whose key starts with the given prefix. */
export async function invalidatePrefix(
  client: QueryClient,
  prefix: QueryKey,
): Promise<void> {
  await client.invalidateQueries({ queryKey: prefix, ...REFETCH });
}

/** Drop all cached API data (sign-out / account switch). */
export function clearAppQueryCache(client: QueryClient): void {
  client.clear();
}

/** Invalidate one or more exact/prefix query keys after a mutation. */
export async function invalidateQueryKeys(
  client: QueryClient,
  keys: QueryKey[],
): Promise<void> {
  const unique = [...new Map(keys.map((key) => [JSON.stringify(key), key])).values()];
  await Promise.all(
    unique.map((queryKey) =>
      client.invalidateQueries({ queryKey, ...REFETCH }),
    ),
  );
}

/** After admin mutations that change pipeline volume / attention. */
export async function invalidateAdminWorkspace(client: QueryClient): Promise<void> {
  await invalidatePrefix(client, queryKeys.scopes.admin());
}

/** After partner/counsellor student or training changes. */
export async function invalidateAgentWorkspace(client: QueryClient): Promise<void> {
  await Promise.all([
    invalidatePrefix(client, queryKeys.scopes.agent()),
    invalidatePrefix(client, queryKeys.scopes.counsellor()),
  ]);
}

/** After student journey mutations (applications, docs, matches). */
export async function invalidateStudentWorkspace(client: QueryClient): Promise<void> {
  await Promise.all([
    invalidatePrefix(client, queryKeys.scopes.student()),
    invalidatePrefix(client, queryKeys.matches()),
    invalidatePrefix(client, queryKeys.scopes.klara()),
  ]);
}
