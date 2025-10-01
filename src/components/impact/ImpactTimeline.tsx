'use client';

import { TimelineEvent } from '@/types/impact';

interface ImpactTimelineProps {
  events: TimelineEvent[];
}

const categoryColors = {
  milestone: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  achievement: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

const categoryIcons = {
  milestone: '🎯',
  update: '📝',
  achievement: '🏆'
};

export default function ImpactTimeline({ events }: ImpactTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute top-0 left-8 h-full w-px bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-20">
            {/* Timeline dot */}
            <div className="absolute left-[29px] -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600" />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl" role="img" aria-label={event.category}>
                  {categoryIcons[event.category]}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                    categoryColors[event.category]
                  }`}
                >
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {event.description}
              </p>

              {event.metrics && event.metrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {event.metrics.map((metric, mIndex) => (
                    <div
                      key={mIndex}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
                    >
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.value} {metric.unit}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {metric.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}