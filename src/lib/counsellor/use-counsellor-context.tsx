import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authFetch } from "@/lib/api/auth-fetch";
import type {
  AgentMeResponse,
  CareerPathingBundle,
  EntitlementsMeResponse,
  SchoolCounsellorContext,
} from "@/lib/api/counsellor-types";
import { cacheOptions } from "@/lib/query/cache-policy";
import { queryKeys } from "@/lib/query/keys";

type CounsellorContextValue = {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  me: AgentMeResponse | null;
  entitlements: EntitlementsMeResponse | null;
  careerPathing: CareerPathingBundle | null;
  context: SchoolCounsellorContext | null;
  counsellorAccessPaid: boolean;
  careerPathingActive: boolean;
  partnerTrainingUnlocked: boolean;
  isAgentActive: boolean;
  needsPasswordSetup: boolean;
  refresh: () => Promise<void>;
};

const CounsellorContext = createContext<CounsellorContextValue | null>(null);

async function fetchMe(): Promise<AgentMeResponse> {
  const response = await authFetch("/api/agent/me");
  const json = (await response.json()) as { data?: AgentMeResponse; error?: string };
  if (!response.ok) {
    throw new Error(json.error ?? "Could not load profile.");
  }
  if (!json.data) {
    throw new Error("Invalid profile response.");
  }
  return json.data;
}

async function fetchEntitlements(): Promise<EntitlementsMeResponse> {
  const response = await authFetch("/api/entitlements/me");
  const json = (await response.json()) as {
    data?: EntitlementsMeResponse;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(json.error ?? "Could not load entitlements.");
  }
  if (!json.data) {
    throw new Error("Invalid entitlements response.");
  }
  return json.data;
}

async function fetchCareerPathing(): Promise<CareerPathingBundle | null> {
  const response = await authFetch("/api/agent/career-pathing");
  const json = (await response.json()) as {
    data?: CareerPathingBundle | { ok: false; error: string };
    error?: string;
  };
  if (!response.ok) {
    throw new Error(json.error ?? "Could not load Career Pathing.");
  }
  const payload = json.data;
  if (!payload || !("ok" in payload) || payload.ok !== true) {
    return null;
  }
  return payload;
}

export function CounsellorProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery<AgentMeResponse>({
    queryKey: queryKeys.counsellorMe(),
    queryFn: fetchMe,
    ...cacheOptions("standard"),
  });

  const isAgentActive = meQuery.data?.profile.isAgentActive ?? false;

  const entitlementsQuery = useQuery<EntitlementsMeResponse>({
    queryKey: queryKeys.counsellorEntitlements(),
    queryFn: fetchEntitlements,
    enabled: isAgentActive,
    ...cacheOptions("standard"),
  });

  const careerPathingQuery = useQuery<CareerPathingBundle | null>({
    queryKey: queryKeys.counsellorCareerPathing(),
    queryFn: fetchCareerPathing,
    enabled: isAgentActive,
    ...cacheOptions("heavy"),
  });

  const context = meQuery.data?.schoolCounsellorContext ?? null;
  const counsellorAccessPaid = context?.counsellorAccessPaid ?? false;
  const careerPathingActive = context?.schoolPlan.active ?? false;
  const partnerTrainingUnlocked =
    context?.schoolPlan.schoolPartnerTrainingAccess ?? false;

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.scopes.counsellor() }),
    ]);
  }, [queryClient]);

  const loading =
    meQuery.isLoading ||
    (isAgentActive && (entitlementsQuery.isLoading || careerPathingQuery.isLoading));

  const refreshing =
    meQuery.isRefetching ||
    entitlementsQuery.isRefetching ||
    careerPathingQuery.isRefetching;

  const error =
    (meQuery.error instanceof Error ? meQuery.error.message : null) ??
    (entitlementsQuery.error instanceof Error ? entitlementsQuery.error.message : null) ??
    (careerPathingQuery.error instanceof Error ? careerPathingQuery.error.message : null);

  const value = useMemo<CounsellorContextValue>(
    () => ({
      loading,
      refreshing,
      error,
      me: meQuery.data ?? null,
      entitlements: entitlementsQuery.data ?? null,
      careerPathing: careerPathingQuery.data ?? null,
      context,
      counsellorAccessPaid,
      careerPathingActive,
      partnerTrainingUnlocked,
      isAgentActive,
      needsPasswordSetup: meQuery.data?.profile.needsPasswordSetup ?? false,
      refresh,
    }),
    [
      loading,
      refreshing,
      error,
      meQuery.data,
      entitlementsQuery.data,
      careerPathingQuery.data,
      context,
      counsellorAccessPaid,
      careerPathingActive,
      partnerTrainingUnlocked,
      isAgentActive,
      refresh,
    ],
  );

  return (
    <CounsellorContext.Provider value={value}>{children}</CounsellorContext.Provider>
  );
}

export function useCounsellorContext() {
  const ctx = useContext(CounsellorContext);
  if (!ctx) {
    throw new Error("useCounsellorContext must be used within CounsellorProvider");
  }
  return ctx;
}

/** Safe for RoleShell / shared layouts that may sit outside CounsellorProvider. */
export function useOptionalCounsellorContext() {
  return useContext(CounsellorContext);
}
