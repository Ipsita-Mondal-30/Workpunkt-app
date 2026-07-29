import { Slot, Redirect } from "expo-router";

import { RoleShell } from "@/components/layout/role-shell";
import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";

export default function AgentLayout() {
  const { loading, session, role, homePath } = useAuth();

  if (loading) return <WorkpunktLoader />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (role !== "agent") return <Redirect href={homePath as never} />;

  return (
    <RoleShell role="agent" title="Agent">
      <Slot />
    </RoleShell>
  );
}
