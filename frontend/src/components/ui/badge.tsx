import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary-50 text-primary-600 border-none",
        neutral: "bg-neutral-100 text-neutral-600 border-none",
        success: "bg-accent-50 text-accent-600 border-none",
        warning: "bg-amber-50 text-amber-600 border-none",
        danger: "bg-red-50 text-red-600 border-none",
        info: "bg-blue-50 text-blue-600 border-none",
        secondary: "bg-neutral-200 text-neutral-800 border-none",
        outline: "border border-neutral-200 text-neutral-600 bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
