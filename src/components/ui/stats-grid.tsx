"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatItem {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  borderColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface StatsGridProps {
  stats: StatItem[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function StatsGrid({
  stats,
  loading = false,
  columns = 4,
  className,
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  if (loading) {
    return (
      <div className={cn("grid gap-3", gridCols[columns], className)}>
        {[...Array(stats.length || columns)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={cn(stat.borderColor && `border-l-4 ${stat.borderColor}`)}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {stat.label}
                </p>
                <div className="text-lg sm:text-xl font-bold truncate">
                  {stat.value}
                </div>
                {stat.subLabel && (
                  <p className="text-xs text-muted-foreground truncate">
                    {stat.subLabel}
                  </p>
                )}
                {stat.trend && (
                  <p
                    className={cn(
                      "text-xs",
                      stat.trend.isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {stat.trend.isPositive ? "↑" : "↓"}{" "}
                    {Math.abs(stat.trend.value)}%
                  </p>
                )}
              </div>
              {stat.icon && (
                <stat.icon
                  className={cn(
                    "h-4 w-4 shrink-0 ml-2",
                    stat.iconColor || "text-muted-foreground"
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
