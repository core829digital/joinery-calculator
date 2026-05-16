import { useAuth } from "@/context/AuthContext";
import {
  hasPermission,
  getPermissions,
  canAccessRoute,
  type Permission,
} from "@/lib/rbac";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? "guest";

  return {
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    permissions: getPermissions(role),
    canAccessRoute: (route: string) => canAccessRoute(role, route),
    role,
    isSupplier: role === "supplier" || role === "admin",
    isDealer: role === "dealer",
    isClient: role === "client",
    isGuest: role === "guest",
  };
}

export function useRoleCheck() {
  const { user } = useAuth();

  return {
    isSupplier: user?.role === "supplier" || user?.role === "admin",
    isDealer: user?.role === "dealer",
    isClient: user?.role === "client",
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
    role: user?.role ?? "guest",
  };
}