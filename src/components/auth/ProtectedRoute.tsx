"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RolePriority } from "@/config/permissions";

// Minimum priority required to access the dashboard
// Users with priority < 20 (NewUser, ReadOnly) see "Insufficient Permissions"
const MIN_DASHBOARD_PRIORITY = RolePriority.DataEntry; // 20

/**
 * Check if JWT token is expired
 * Returns true if token is missing, malformed, or expired
 */
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    // Add 30 second buffer to handle clock skew
    return Date.now() >= (exp * 1000) - 30000;
  } catch {
    return true;
  }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    // Check if token exists and is not expired
    if (!userStr || isTokenExpired(token)) {
      // Not logged in or token expired, clear storage and redirect
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
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
      localStorage.removeItem("auth_token");
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
