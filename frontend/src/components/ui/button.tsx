import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] focus:shadow-focus",
  {
    variants: {
      variant: {
        solid: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
        outline: "border border-primary-500 text-primary-600 hover:bg-primary-50 bg-transparent",
        ghost: "text-neutral-600 hover:bg-neutral-100 bg-transparent",
        danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-lg",
        md: "h-12 lg:h-10 px-6 lg:px-4 rounded-xl",
        lg: "h-14 lg:h-12 px-8 lg:px-6 text-base rounded-2xl",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
