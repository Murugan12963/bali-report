"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const circularIndicatorVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      size: {
        default: "h-32 w-32",
        sm: "h-24 w-24",
        lg: "h-40 w-40",
      },
      variant: {
        default: "text-primary-500",
        secondary: "text-secondary-400",
        accent: "text-accent-500",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

interface FuturisticCircularIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularIndicatorVariants> {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  animate?: boolean;
  thickness?: number;
}

const FuturisticCircularIndicator = React.forwardRef<HTMLDivElement, FuturisticCircularIndicatorProps>(
  (
    {
      className,
      size,
      variant,
      value,
      max = 100,
      label,
      sublabel,
      animate = true,
      thickness = 4,
      ...props
    },
    ref
  ) => {
    // Calculate percentage and circle properties
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = 45; // SVG coordinate space
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div
        className={cn(
          circularIndicatorVariants({ size, variant, className }),
          "group"
        )}
        ref={ref}
        {...props}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 rounded-full opacity-5">
          <div
            className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,#ffffff12_50%,transparent_100%)]"
            style={{
              clipPath: "circle(50% at center)",
              animation: animate ? "spin 10s linear infinite" : "none",
            }}
          />
        </div>

        {/* SVG Circle */}
        <svg className="h-full w-full -rotate-90 transform">
          {/* Background track */}
          <circle
            className="text-dark-border opacity-20"
            stroke="currentColor"
            strokeWidth={thickness}
            fill="none"
            cx="50%"
            cy="50%"
            r={radius}
          />
          
          {/* Progress circle */}
          <circle
            className={cn(
              "transition-all",
              animate && "animate-[dash_1.5s_ease-in-out]"
            )}
            stroke="currentColor"
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={animate ? circumference : strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            cx="50%"
            cy="50%"
            r={radius}
            style={{
              transition: animate ? "stroke-dashoffset 1.5s ease-in-out" : "none",
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-dark-text">
          {label && (
            <span className="text-xs font-medium text-dark-muted">{label}</span>
          )}
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          {sublabel && (
            <span className="text-xs font-medium text-dark-muted">{sublabel}</span>
          )}
        </div>

        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full opacity-0 blur transition-opacity group-hover:opacity-40",
            variant === "default" && "bg-primary-500",
            variant === "secondary" && "bg-secondary-400",
            variant === "accent" && "bg-accent-500"
          )}
        />
      </div>
    );
  }
);

FuturisticCircularIndicator.displayName = "FuturisticCircularIndicator";

export { FuturisticCircularIndicator, circularIndicatorVariants };