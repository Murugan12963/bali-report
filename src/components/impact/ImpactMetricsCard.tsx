'use client';

import { useMemo } from 'react';
import { ImpactMetrics } from '@/types/impact';

interface ImpactMetricsCardProps {
  metrics: ImpactMetrics;
}

interface MetricDisplayConfig {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
}

export default function ImpactMetricsCard({ metrics }: ImpactMetricsCardProps) {
  const displayMetrics = useMemo((): MetricDisplayConfig[] => [
    {
      label: 'Total Impact Fund',
      value: metrics.bpdAllocation,
      prefix: '$',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Projects Supported',
      value: metrics.projectsSupported,
      suffix: 'projects',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'People Impacted',
      value: metrics.peopleImpacted,
      suffix: 'people',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Communities Served',
      value: metrics.communitiesServed,
      suffix: 'communities',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ], [metrics]);

  const formatValue = (config: MetricDisplayConfig) => {
    const formatted = config.value.toLocaleString();
    return `${config.prefix || ''}${formatted}${config.suffix ? ` ${config.suffix}` : ''}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayMetrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center"
        >
          <div className={`text-3xl font-bold ${metric.color}`}>
            {formatValue(metric)}
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
}