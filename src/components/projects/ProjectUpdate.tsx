'use client';

import Image from 'next/image';
import { ProjectUpdate as ProjectUpdateType } from '@/types/project-update';

interface ProjectUpdateProps {
  update: ProjectUpdateType;
}

const updateTypeColors = {
  milestone: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  challenge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  success: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

const updateTypeIcons = {
  milestone: '🎯',
  progress: '📈',
  challenge: '⚠️',
  success: '🎉'
};

export default function ProjectUpdate({ update }: ProjectUpdateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {update.author.avatar && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={update.author.avatar}
                  alt={update.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {update.author.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {update.author.role}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label={update.type}>
              {updateTypeIcons[update.type]}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${updateTypeColors[update.type]}`}>
              {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {update.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {update.content}
          </p>
        </div>

        {update.metrics && update.metrics.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Impact Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {update.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {metric.name}
                  </div>
                  {metric.change !== undefined && metric.change !== null && (
                    <div
                      className={`text-sm mt-1 ${
                        metric.change >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {metric.change >= 0 ? '+' : ''}
                      {metric.change}% change
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {update.images && update.images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Images
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {update.images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-48 rounded-lg overflow-hidden"
                >
                  <Image
                    src={image.url}
                    alt={image.caption}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                    {image.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {update.tags && update.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {update.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          Posted on {new Date(update.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}