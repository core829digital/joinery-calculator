"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SupplierDashboardComponent from "@/components/supplier/SupplierDashboard";
import { Loader2 } from "lucide-react";

export default function SupplierDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard/supplier");
    } else if (user && user.role !== "supplier") {
      switch (user.role) {
        case "dealer":
          router.push("/dashboard/dealer");
          break;
        case "client":
          router.push("/configurator");
          break;
        default:
          router.push("/");
      }
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || (user && user.role !== "supplier")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return <SupplierDashboardComponent />;
}