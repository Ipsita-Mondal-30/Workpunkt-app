import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

import {
  resolveAppRole,
  roleHomePath,
  type AppRole,
  type ProfileFlags,
} from "@/lib/auth/resolve-role";
import { bootError, bootLog, bootWarn } from "@/lib/debug/boot-log";
import { clearAppQueryCache } from "@/lib/query/invalidate";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileFlags | null;
  role: AppRole | null;
  loading: boolean;
  homePath: string;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; role: AppRole | null; homePath: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<ProfileFlags | null> {
  bootLog("auth:loadProfile:start", { userId });
  const { data, error } = await supabase
    .from("profiles")
    .select("role, admin_role, name, email, is_agent_active, is_enrolled, needs_password_setup")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    bootError("auth:loadProfile", error.message);
    return null;
  }

  bootLog("auth:loadProfile:ok", {
    role: data?.role ?? null,
    adminRole: data?.admin_role ?? null,
  });
  return (data as ProfileFlags | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileFlags | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (next: Session | null) => {
    bootLog("auth:applySession", {
      hasSession: Boolean(next),
      userId: next?.user?.id ?? null,
    });
    setSession(next);
    if (!next?.user) {
      setProfile(null);
      return;
    }
    const nextProfile = await loadProfile(next.user.id);
    setProfile(nextProfile);
    const role = resolveAppRole(nextProfile);
    bootLog("auth:session-ready", {
      userId: next.user.id,
      email: next.user.email,
      role,
      homePath: roleHomePath(role),
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    bootLog("auth:provider-mounted");

    void (async () => {
      try {
        bootLog("auth:getSession:start");
        const {
          data: { session: existing },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          bootWarn("auth:getSession:error", error.message);
        }
        if (!mounted) return;
        await applySession(existing);
      } catch (error) {
        bootError("auth:getSession:throw", error);
      } finally {
        if (mounted) {
          setLoading(false);
          bootLog("auth:loading-false");
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      bootLog("auth:onAuthStateChange", { event, hasSession: Boolean(next) });
      if (event === "SIGNED_OUT") {
        clearAppQueryCache(queryClient);
      }
      void (async () => {
        try {
          await applySession(next);
        } catch (error) {
          bootError("auth:onAuthStateChange:apply", error);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      bootLog("auth:provider-unmounted");
    };
  }, [applySession, queryClient]);

  const signIn = useCallback(async (email: string, password: string) => {
    bootLog("auth:signIn:start", { email });
    // Avoid flashing the previous account's cached API payloads.
    clearAppQueryCache(queryClient);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      bootError("auth:signIn", error.message);
      return { error: error.message, role: null, homePath: "/(auth)/login" };
    }

    bootLog("auth:signIn:success", { userId: data.user?.id });
    await applySession(data.session);

    const nextProfile = data.session?.user
      ? await loadProfile(data.session.user.id)
      : null;
    const nextRole = resolveAppRole(nextProfile);
    const nextHome = roleHomePath(nextRole);
    bootLog("auth:signIn:route", { role: nextRole, dest: nextHome });
    return { error: null, role: nextRole, homePath: nextHome };
  }, [applySession, queryClient]);

  const signOut = useCallback(async () => {
    bootLog("auth:signOut");
    await supabase.auth.signOut();
    clearAppQueryCache(queryClient);
    setSession(null);
    setProfile(null);
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const nextProfile = await loadProfile(session.user.id);
    setProfile(nextProfile);
  }, [session?.user]);

  const role = session ? resolveAppRole(profile) : null;
  const homePath = role ? roleHomePath(role) : "/(auth)/login";

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      homePath,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, profile, role, loading, homePath, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
