"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Share2, MessageSquare, Eye, ThumbsUp, Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialProofProps {
  shares: number;
  comments: number;
  views: number;
  likes: number;
  reliability: number;
  className?: string;
}

interface MetricProps {
  icon: React.ComponentType<any>;
  value: number;
  tooltip: string;
  formatValue?: (value: number) => string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatReliability(value: number): string {
  return `${value}%`;
}

export function SocialProof({
  shares,
  comments,
  views,
  likes,
  reliability,
  className = "",
}: SocialProofProps) {
  const locale = useLocale();

  const metrics: MetricProps[] = [
    {
      icon: Share2,
      value: shares,
      tooltip: "Total shares",
      formatValue: formatNumber,
    },
    {
      icon: MessageSquare,
      value: comments,
      tooltip: "Comments",
      formatValue: formatNumber,
    },
    {
      icon: Eye,
      value: views,
      tooltip: "Views",
      formatValue: formatNumber,
    },
    {
      icon: ThumbsUp,
      value: likes,
      tooltip: "Likes",
      formatValue: formatNumber,
    },
    {
      icon: Award,
      value: reliability,
      tooltip: "Source reliability score",
      formatValue: formatReliability,
    },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <TooltipProvider>
        {metrics.map(
          ({
            icon: Icon,
            value,
            tooltip,
            formatValue = (v) => v.toString(),
          }) => (
            <Tooltip key={tooltip} content={tooltip}>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 cursor-help">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{formatValue(value)}</span>
              </div>
            </Tooltip>
          ),
        )}
      </TooltipProvider>
    </div>
  );
}
