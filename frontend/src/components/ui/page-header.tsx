import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  className, 
  ...props 
}: PageHeaderProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-neutral-100 dark:border-neutral-800", 
        className
      )} 
      {...props}
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
