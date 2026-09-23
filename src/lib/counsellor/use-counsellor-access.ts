import { useCallback } from "react";

import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import type { AgentDashboardData, EntitlementsMeSummary } from "@/lib/counsellor/types";

function inferAccessPaidFromEntitlements(
  entitlements: EntitlementsMeSummary | undefined,
): boolean {
  if (!entitlements) return false;
  if (entitlements.schoolPlan.active) return true;
  return entitlements.schoolPurchaseHistory.some(
    (item) => item.productType === "school_counsellor_access",
  );
}

export function useCounsellorAccess() {
  const entitlementsQuery = useApiQuery<EntitlementsMeSummary>(
    queryKeys.entitlementsMe(),
    "/api/entitlements/me",
    { cachePolicy: "standard" },
  );

  const dashboardQuery = useApiQuery<AgentDashboardData>(
    queryKeys.agentDashboard(),
    "/api/agent/dashboard",
    { cachePolicy: "standard" },
  );

  const entitlements = entitlementsQuery.data;
  const dashboardAccessPaid =
    dashboardQuery.data?.schoolCounsellorContext?.counsellorAccessPaid;
  const accessPaid =
    dashboardAccessPaid ?? inferAccessPaidFromEntitlements(entitlements);
  const planActive = Boolean(entitlements?.schoolPlan.active);

  const loading = entitlementsQuery.isLoading || dashboardQuery.isLoading;

  const refetch = useCallback(() => {
    void entitlementsQuery.refetch();
    void dashboardQuery.refetch();
  }, [dashboardQuery, entitlementsQuery]);

  return {
    loading,
    accessPaid,
    planActive,
    entitlements,
    refetch,
  };
}
