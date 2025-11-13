"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await api.auth.logout();
      
      // Clear user data from localStorage
      localStorage.removeItem('user');
      
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  
  return (
    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
