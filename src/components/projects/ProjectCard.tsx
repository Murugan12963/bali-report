'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Project } from '@/types/project-update';

interface ProjectCardProps {
  project: Project;
}

const categoryColors = {
  agritech: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  energy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ngo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

const categoryIcons = {
  agritech: '🌱',
  energy: '⚡',
  ngo: '🎓'
};

const statusColors = {
  planned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const latestUpdate = project.updates[0];
  const fundingPercentage = (project.fundingReceived / project.budget) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label={project.category}>
              {categoryIcons[project.category]}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[project.category]}`}>
              {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {project.name}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {project.description}
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              {project.location}
            </div>
            <div className="flex items-center">
              <span className="mr-2">📅</span>
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">
                ${project.fundingReceived.toLocaleString()} raised
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                ${project.budget.toLocaleString()} goal
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, fundingPercentage)}%` }}
              />
            </div>
          </div>

          {project.impact.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {project.impact.map((impact, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
                >
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {impact.value} {impact.unit}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {impact.metric}
                  </div>
                </div>
              ))}
            </div>
          )}

          {latestUpdate && (
            <div className="border-t dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-start space-x-3">
                {latestUpdate.author.avatar && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={latestUpdate.author.avatar}
                      alt={latestUpdate.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {latestUpdate.author.name}
                    </h4>
                    <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(latestUpdate.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {latestUpdate.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Link
              href={`/projects/${project.id}`}
              className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              View Project Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}