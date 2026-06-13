import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type UnifiedUser = {
  id: number;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  authType: "oauth" | "local";
};

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !oauthUser,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    // Always clear both auth systems
    localStorage.removeItem("local_auth_token");
    logoutMutation.mutate();
    // Reload page to reset all state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [logoutMutation]);

  const user = useMemo((): UnifiedUser | null => {
    if (oauthUser) {
      return {
        id: oauthUser.id,
        name: oauthUser.name || "User",
        role: oauthUser.role as "user" | "admin",
        avatar: oauthUser.avatar || undefined,
        authType: "oauth",
      };
    }
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name || localUser.displayName || localUser.username,
        role: localUser.role as "user" | "admin",
        authType: "local",
      };
    }
    return null;
  }, [oauthUser, localUser]);

  const isLoading = oauthLoading || (localLoading && !oauthUser);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.role === "admin",
      logout,
    }),
    [user, isLoading, logout]
  );
}
