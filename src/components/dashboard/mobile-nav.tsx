"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";
import { routeGroups } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess, RolePriority } from "@/config/permissions";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  // Use nullish coalescing to preserve priority 0 (NewUser)
  const userPriority = user?.priority ?? RolePriority.ReadOnly;

  // Filter route groups based on user permissions
  const visibleGroups = routeGroups
    .map((group) => ({
      ...group,
      routes: group.routes.filter((route) =>
        canAccess(userPriority, route.resource, "read")
      ),
    }))
    .filter((group) => group.routes.length > 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
          <div className="px-3 py-2 flex-1 overflow-y-auto">
            <Link
              href="/dashboard"
              className="flex items-center pl-3 mb-8"
              onClick={() => setOpen(false)}
            >
              <h1 className="text-2xl font-bold">{siteConfig.name}</h1>
            </Link>
            <div className="space-y-6">
              {visibleGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                          pathname === route.href
                            ? "text-white bg-white/10"
                            : "text-zinc-400"
                        )}
                      >
                        <div className="flex items-center flex-1">
                          <route.icon className="h-5 w-5 mr-3" />
                          {route.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Info Footer */}
          <div className="px-3 py-3 border-t border-zinc-700 mt-auto">
            <div className="flex items-center gap-2 px-3">
              <Shield className="h-4 w-4 text-zinc-500" />
              <div className="text-xs text-zinc-500">
                <p className="truncate">{user?.email || "Not logged in"}</p>
                <p>
                  {user?.roleName || "Unknown"} (P:{userPriority})
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
