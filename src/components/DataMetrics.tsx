'use client';

import React, { useEffect, useState, useRef } from 'react';

interface MetricProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: 'cyan' | 'red' | 'blue' | 'pink';
  icon?: string;
}

const Metric: React.FC<MetricProps> = ({
  label,
  value,
  suffix = '',
  prefix = '',
  color = 'cyan',
  icon = '●'
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const metricRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    cyan: 'text-[var(--color-glow)] shadow-[0_0_10px_rgba(0,255,204,0.3)]',
    red: 'text-[var(--color-glow-secondary)] shadow-[0_0_10px_rgba(255,107,107,0.3)]',
    blue: 'text-[var(--color-cyber-blue)] shadow-[0_0_10px_rgba(0,184,255,0.3)]',
    pink: 'text-[var(--color-neon-pink)] shadow-[0_0_10px_rgba(255,46,151,0.3)]',
  };

  const indicatorColors = {
    cyan: 'bg-[var(--color-glow)] shadow-[0_0_10px_rgba(0,255,204,0.6)]',
    red: 'bg-[var(--color-glow-secondary)] shadow-[0_0_10px_rgba(255,107,107,0.6)]',
    blue: 'bg-[var(--color-cyber-blue)] shadow-[0_0_10px_rgba(0,184,255,0.6)]',
    pink: 'bg-[var(--color-neon-pink)] shadow-[0_0_10px_rgba(255,46,151,0.6)]',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (metricRef.current) {
      observer.observe(metricRef.current);
    }

    return () => {
      if (metricRef.current) {
        observer.unobserve(metricRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={metricRef}
      className="relative p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-grid-line)] hover:border-[var(--color-glow)] transition-all duration-300 group overflow-hidden"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-glow)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${indicatorColors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${indicatorColors[color]} animate-pulse`}></div>
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-dimmed)]">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className={`text-3xl font-bold font-mono ${colorClasses[color]} relative z-10`}>
        {prefix}{displayValue.toLocaleString()}{suffix}
      </div>

      {/* Icon decoration */}
      <div className="absolute bottom-2 right-2 text-4xl opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        {icon}
      </div>
    </div>
  );
};

interface DataMetricsProps {
  metrics: Array<Omit<MetricProps, 'value'> & { value: number }>;
  title?: string;
  className?: string;
}

/**
 * Futuristic data metrics dashboard component with animated counters
 */
const DataMetrics: React.FC<DataMetricsProps> = ({ metrics, title, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-xl font-bold font-display text-[var(--color-glow)] flex items-center gap-3">
            <div className="w-1 h-6 bg-[var(--color-glow)] shadow-[0_0_10px_rgba(0,255,204,0.6)]"></div>
            {title}
          </h3>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Metric key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default DataMetrics;
export { Metric };
