"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <Button variant="ghost" onClick={logout} className="w-full justify-start">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
