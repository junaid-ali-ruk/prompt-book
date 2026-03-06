import { useAuth, useUser } from "@insforge/react";
import { useQuery } from "@tanstack/react-query";

import { insforge } from "@/lib/insforge";
import { queryKeys } from "@/lib/query-keys";

async function getIsAdmin() {
  const { data, error } = await insforge.database.rpc("is_project_admin");
  if (error) throw error;
  return Boolean(data);
}

export function useAuthSession() {
  const auth = useAuth();
  const { user, isLoaded } = useUser();

  const adminQuery = useQuery({
    queryKey: [...queryKeys.auth, "admin", user?.id ?? "guest"],
    queryFn: getIsAdmin,
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const displayName = user?.profile?.name?.trim() || user?.email?.split("@")[0] || "anon";

  return {
    ...auth,
    isLoaded,
    user,
    userId: user?.id ?? null,
    displayName,
    isAdmin: Boolean(adminQuery.data),
    isAdminLoading: adminQuery.isLoading,
  };
}

