"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DealerDashboardComponent from "@/components/dealer/DealerDashboard";
import { Loader2 } from "lucide-react";

export default function DealerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard/dealer");
    } else if (user && user.role !== "dealer") {
      switch (user.role) {
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
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || (user && user.role !== "dealer")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return <DealerDashboardComponent />;
}