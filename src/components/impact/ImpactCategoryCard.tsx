'use client';

import { ImpactCategory } from '@/types/impact';

interface ImpactCategoryCardProps {
  category: ImpactCategory;
}

export default function ImpactCategoryCard({ category }: ImpactCategoryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {category.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {category.description}
        </p>

        <div className="space-y-4">
          {category.metrics.map((metric, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {metric.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {metric.value} {metric.unit}
                  </span>
                  {metric.change !== undefined && (
                    <span
                      className={`text-sm ${
                        metric.change >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {metric.change >= 0 ? '+' : ''}
                      {metric.change}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (metric.value / (metric.value * 2)) * 100)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}