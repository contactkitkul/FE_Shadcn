"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  roleName: string;
  priority: number;
}

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const router = useRouter();

  const logout = async () => {
    try {
      await api.auth.logout();
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const getUser = (): User | null => {
    if (typeof window === "undefined") return null;
    
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse user:", error);
      return null;
    }
  };

  const setUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
  };

  return { logout, getUser, setUser };
}
