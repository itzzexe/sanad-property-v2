"use client";

import { LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  href 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-neutral-200 dark:text-neutral-700" />
      </div>
      <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="text-sm text-neutral-400 font-bold mt-2 max-w-sm">
        {description}
      </p>
      {actionLabel && (
        <Button 
          className="mt-8 font-black shadow-lg shadow-primary-500/10 h-11 px-8"
          onClick={onAction}
          asChild={!!href}
        >
          {href ? (
            <a href={href}>
               <Plus className="w-4 h-4 mr-2" /> {actionLabel}
            </a>
          ) : (
            <>
               <Plus className="w-4 h-4 mr-2" /> {actionLabel}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
