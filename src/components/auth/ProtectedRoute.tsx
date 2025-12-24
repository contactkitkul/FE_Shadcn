"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RolePriority } from "@/config/permissions";

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

// Minimum priority required to access the dashboard
// Users with priority < 20 (NewUser, ReadOnly) see "Insufficient Permissions"
const MIN_DASHBOARD_PRIORITY = RolePriority.DataEntry; // 20

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (BYPASS_AUTH) {
      // Dev bypass: treat as authenticated without checking localStorage
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Check if user is logged in
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      // Not logged in, redirect to login
      router.push("/login");
      setIsLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const userPriority = user?.priority ?? 0;

      // Allow access to unauthorized page regardless of priority
      if (pathname === "/dashboard/unauthorized") {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check if user has minimum required priority
      if (userPriority < MIN_DASHBOARD_PRIORITY) {
        // Insufficient permissions, redirect to unauthorized page
        router.push("/dashboard/unauthorized");
        setIsLoading(false);
        return;
      }

      // User is authenticated and has sufficient permissions
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("user");
      router.push("/login");
    }

    setIsLoading(false);
  }, [router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
