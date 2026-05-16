"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface RoleGuardProps {
  allowedRoles: Array<"client" | "dealer" | "supplier" | "admin">;
  children: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (!allowedRoles.includes(user.role as "client" | "dealer" | "supplier" | "admin")) {
      switch (user.role) {
        case "dealer":
          router.push("/dashboard/dealer");
          break;
        case "supplier":
          router.push("/dashboard/supplier");
          break;
        case "client":
          router.push("/configurator");
          break;
        default:
          router.push("/");
      }
    }
  }, [user, isAuthenticated, allowedRoles, pathname, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowedRoles.includes(user.role as "client" | "dealer" | "supplier" | "admin")) {
    return null;
  }

  return <>{children}</>;
}

export function useRouteProtection() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const protect = (allowedRoles: Array<"client" | "dealer" | "supplier" | "admin">) => {
    if (!isAuthenticated || !user) {
      return false;
    }
    return allowedRoles.includes(user.role as "client" | "dealer" | "supplier" | "admin");
  };

  const getRedirectPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "dealer":
        return "/dashboard/dealer";
      case "supplier":
        return "/dashboard/supplier";
      case "client":
        return "/configurator";
      default:
        return "/";
    }
  };

  return { protect, getRedirectPath, user, isAuthenticated };
}