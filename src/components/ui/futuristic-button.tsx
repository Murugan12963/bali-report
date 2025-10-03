"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles with futuristic cyber theme
  "relative inline-flex items-center justify-center rounded-md text-sm font-mono font-medium uppercase tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-glow)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none overflow-hidden group",
  {
    variants: {
      variant: {
        // Cyan glow button
        default:
          "bg-transparent border-2 border-[var(--color-glow)] text-[var(--color-glow)] hover:bg-[var(--color-glow)] hover:text-[var(--background)] shadow-[0_0_10px_rgba(0,255,204,0.3)] hover:shadow-[0_0_20px_rgba(0,255,204,0.6),0_0_40px_rgba(0,255,204,0.3)]",
        // Red/danger button
        danger:
          "bg-transparent border-2 border-[var(--color-glow-secondary)] text-[var(--color-glow-secondary)] hover:bg-[var(--color-glow-secondary)] hover:text-[var(--background)] shadow-[0_0_10px_rgba(255,107,107,0.3)] hover:shadow-[0_0_20px_rgba(255,107,107,0.6),0_0_40px_rgba(255,107,107,0.3)]",
        // Blue accent button
        accent:
          "bg-transparent border-2 border-[var(--color-cyber-blue)] text-[var(--color-cyber-blue)] hover:bg-[var(--color-cyber-blue)] hover:text-[var(--background)] shadow-[0_0_10px_rgba(0,184,255,0.3)] hover:shadow-[0_0_20px_rgba(0,184,255,0.6)]",
        // Outline button
        outline:
          "border border-[var(--color-grid-line)] bg-transparent text-[var(--foreground)] hover:border-[var(--color-glow)] hover:text-[var(--color-glow)] hover:shadow-[0_0_10px_rgba(0,255,204,0.2)]",
        // Ghost button
        ghost:
          "bg-transparent text-[var(--color-glow)] hover:bg-[var(--color-glow)]/10 hover:shadow-[0_0_10px_rgba(0,255,204,0.2)]",
        // Gradient button
        gradient:
          "bg-gradient-to-r from-[var(--color-glow)] via-[var(--color-data)] to-[var(--color-cyber-blue)] text-[var(--background)] shadow-[0_0_15px_rgba(0,255,204,0.4)] hover:shadow-[0_0_25px_rgba(0,255,204,0.6),0_0_50px_rgba(0,255,204,0.3)] hover:brightness-110",
        // Solid filled button
        solid:
          "bg-[var(--color-glow)] text-[var(--background)] border-2 border-[var(--color-glow)] shadow-[0_0_15px_rgba(0,255,204,0.4)] hover:shadow-[0_0_25px_rgba(0,255,204,0.6)] hover:brightness-110",
      },
      size: {
        default: "h-10 px-6 py-2 text-xs",
        sm: "h-8 px-4 text-[10px]",
        lg: "h-12 px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
        loading && "cursor-wait opacity-60",
      )}
      ref={ref}
      disabled={loading}
      {...props}
    >
      {/* Animated background fill on hover */}
      <span
        className="absolute inset-0 bg-current opacity-0 transition-all duration-300 group-hover:opacity-100 -z-10"
        style={{
          transform: "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
      />

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

      <span className="relative z-10">{children}</span>
    </button>
  );
});

FuturisticButton.displayName = "FuturisticButton";

export { FuturisticButton, buttonVariants };
