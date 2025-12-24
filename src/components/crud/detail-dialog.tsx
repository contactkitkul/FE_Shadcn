"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Field definition for detail sections
export interface DetailField<T> {
  label: string;
  value: (item: T) => React.ReactNode;
  className?: string;
}

// Section definition
export interface DetailSection<T> {
  title: string;
  icon?: React.ReactNode;
  fields?: DetailField<T>[];
  render?: (item: T) => React.ReactNode;
}

// Action button definition
export interface DetailAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  disabled?: (item: T) => boolean;
  show?: (item: T) => boolean;
}

export interface DetailDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: T | null;
  title: string;
  description?: string | ((item: T) => string);
  sections: DetailSection<T>[];
  actions?: DetailAction<T>[];
  loading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function DetailDialog<T>({
  open,
  onOpenChange,
  item,
  title,
  description,
  sections,
  actions,
  loading = false,
  maxWidth = "2xl",
}: DetailDialogProps<T>) {
  const descriptionText = item
    ? typeof description === "function"
      ? description(item)
      : description
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidthClasses[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {descriptionText && (
            <DialogDescription>{descriptionText}</DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : item ? (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <React.Fragment key={sectionIndex}>
                {sectionIndex > 0 && <Separator />}
                <div>
                  {section.title && (
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      {section.icon}
                      {section.title}
                    </h4>
                  )}
                  {section.render ? (
                    section.render(item)
                  ) : section.fields ? (
                    <div className="grid grid-cols-2 gap-4">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className={field.className}>
                          <p className="text-sm text-muted-foreground">
                            {field.label}: {field.value(item)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </React.Fragment>
            ))}

            {/* Actions */}
            {actions && actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {actions
                  .filter((action) => !action.show || action.show(item))
                  .map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant={action.variant || "default"}
                      onClick={() => action.onClick(item)}
                      disabled={action.disabled?.(item)}
                      className={actions.length === 1 ? "w-full" : ""}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Convenience component for a simple info grid
export interface InfoGridProps {
  items: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2 | 3;
}

export function InfoGrid({ items, columns = 2 }: InfoGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item, index) => (
        <div key={index}>
          <p className="text-sm text-muted-foreground">
            {item.label}: {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// Convenience component for a list of items
export interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  maxHeight?: string;
}

export function ItemList<T>({
  items,
  renderItem,
  emptyMessage = "No items found",
  maxHeight = "300px",
}: ItemListProps<T>) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-2" style={{ maxHeight, overflowY: "auto" }}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}
