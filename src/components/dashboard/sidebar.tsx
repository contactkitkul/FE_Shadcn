"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routeGroups } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess, RolePriority } from "@/config/permissions";
import { Loader2, Shield } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Use nullish coalescing to preserve priority 0 (NewUser)
  // Only default to ReadOnly if priority is null/undefined (legacy data)
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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
        <div className="px-3 py-2 flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <Link href="/dashboard" className="flex items-center pl-3 mb-8">
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

      {/* User Info Footer - helps debug permission issues */}
      <div className="px-3 py-3 border-t border-zinc-700">
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
  );
}
