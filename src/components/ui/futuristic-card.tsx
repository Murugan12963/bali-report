"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  // Base styles
  "relative rounded-lg border bg-dark-surface text-dark-text transition-all",
  {
    variants: {
      variant: {
        default: "border-dark-border hover:border-primary-500 hover:shadow-glow",
        highlight:
          "border-primary-500 shadow-glow bg-gradient-to-b from-dark-surface to-dark-highlight/20",
        active:
          "border-primary-500 shadow-glow-lg bg-gradient-to-b from-dark-surface to-dark-highlight/40",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

interface FuturisticCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  gridOverlay?: boolean;
}

const FuturisticCard = React.forwardRef<HTMLDivElement, FuturisticCardProps>(
  (
    {
      className,
      variant,
      padding,
      header,
      footer,
      gridOverlay = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      >
        {/* Grid overlay */}
        {gridOverlay && (
          <div className="absolute inset-0 rounded-lg opacity-5">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
        )}

        {/* Glowing border corners */}
        <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 blur transition-opacity group-hover:opacity-30" />

        {/* Header */}
        {header && (
          <div className="mb-4 border-b border-dark-border pb-4">{header}</div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 border-t border-dark-border pt-4">{footer}</div>
        )}
      </div>
    );
  }
);

FuturisticCard.displayName = "FuturisticCard";

export { FuturisticCard, cardVariants };