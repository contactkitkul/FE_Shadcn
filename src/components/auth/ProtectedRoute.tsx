"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
    const user = localStorage.getItem("user");

    if (!user) {
      // Not logged in, redirect to login
      router.push("/login");
    } else {
      // Logged in, allow access
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [router]);

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
