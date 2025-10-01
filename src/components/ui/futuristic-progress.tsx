"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative h-4 w-full overflow-hidden rounded bg-dark-surface border border-dark-border",
  {
    variants: {
      variant: {
        default: "border-primary-500/20",
        secondary: "border-secondary-400/20",
        accent: "border-accent-500/20",
      },
      size: {
        default: "h-4",
        sm: "h-2",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface FuturisticProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  animate?: boolean;
  segments?: number;
}

const FuturisticProgress = React.forwardRef<HTMLDivElement, FuturisticProgressProps>(
  (
    {
      className,
      variant,
      size,
      value,
      max = 100,
      showValue = false,
      animate = true,
      segments = 0,
      ...props
    },
    ref
  ) => {
    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Generate segment markers if needed
    const segmentMarkers = segments > 0 ? Array.from({ length: segments - 1 }, (_, i) => {
      const position = ((i + 1) / segments) * 100;
      return (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-dark-border"
          style={{ left: `${position}%` }}
        />
      );
    }) : null;

    return (
      <div
        className={cn(
          progressVariants({ variant, size, className }),
          "group relative"
        )}
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px)] bg-[size:8px_100%]" />
        </div>

        {/* Segment markers */}
        {segmentMarkers}

        {/* Progress bar */}
        <div
          className={cn(
            "h-full w-full transition-transform",
            animate && "animate-[slide-right_1.5s_ease-in-out]",
            variant === "default" && "bg-gradient-to-r from-primary-500 to-primary-400",
            variant === "secondary" && "bg-gradient-to-r from-secondary-500 to-secondary-400",
            variant === "accent" && "bg-gradient-to-r from-accent-500 to-accent-400"
          )}
          style={{ transform: `translateX(${percentage - 100}%)` }}
        >
          {/* Scanning animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
        </div>

        {/* Value label */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            <span className="text-xs font-medium text-dark-text">
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Glow effect */}
        <div className="absolute inset-0 rounded bg-gradient-to-r from-primary-500/20 to-transparent opacity-0 blur transition-opacity group-hover:opacity-100" />
      </div>
    );
  }
);

FuturisticProgress.displayName = "FuturisticProgress";

export { FuturisticProgress, progressVariants };