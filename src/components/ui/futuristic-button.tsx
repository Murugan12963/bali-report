"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-dark-surface border border-primary-500 text-primary-500 shadow-glow hover:shadow-glow-lg hover:bg-primary-500 hover:text-dark-surface",
        destructive:
          "bg-dark-surface border border-secondary-400 text-secondary-400 shadow-neon-red hover:bg-secondary-400 hover:text-dark-surface",
        outline:
          "border border-dark-border bg-transparent hover:border-primary-500 hover:shadow-glow",
        ghost:
          "bg-transparent text-primary-500 hover:bg-primary-500/10 hover:shadow-glow",
        link: "text-primary-500 underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary-500 to-accent-500 text-dark-surface shadow-glow hover:shadow-glow-lg hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const FuturisticButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
      loading?: boolean;
    }
>(({ className, variant, size, loading = false, children, ...props }, ref) => {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && "cursor-wait opacity-60"
      )}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {/* Glowing border effect */}
      <span className="absolute inset-0 rounded-md bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
      
      {/* Loading spinner */}
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      
      {children}
    </button>
  );
});

FuturisticButton.displayName = "FuturisticButton";

export { FuturisticButton, buttonVariants };