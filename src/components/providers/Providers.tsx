"use client";

import { ReactNode } from "react";
import { ReactQueryProvider } from "@/lib/react-query";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </AuthProvider>
  );
}
