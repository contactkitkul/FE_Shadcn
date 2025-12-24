"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routeGroups } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess } from "@/config/permissions";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userPriority = user?.priority ?? 0;

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
    </div>
  );
}
