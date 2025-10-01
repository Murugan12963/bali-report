'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MOCK_PROJECTS } from '@/types/project-update';
import ProjectUpdate from '@/components/projects/ProjectUpdate';

export default function ProjectDetailPage() {
  const params = useParams();
  const project = MOCK_PROJECTS.find(p => p.id === params.id);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const fundingPercentage = (project.fundingReceived / project.budget) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl" role="img" aria-label={project.category}>
                    {{
                      agritech: '🌱',
                      energy: '⚡',
                      ngo: '🎓'
                    }[project.category]}
                  </span>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {project.name}
                    </h1>
                    <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-4">
                        <span className="mr-2">📍</span>
                        {project.location}
                      </span>
                      <span>
                        <span className="mr-2">📅</span>
                        Started {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    {
                      planned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }[project.status]
                  }`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {project.description}
              </p>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Impact Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.impact.map((impact, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {impact.value} {impact.unit}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {impact.metric}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {project.partners.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Project Partners
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.partners.map((partner, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700"
                      >
                        {partner.logo ? (
                          <div className="relative w-12 h-12">
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">
                            {partner.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {partner.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {partner.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Project Updates
              </h2>
              {project.updates.map(update => (
                <ProjectUpdate key={update.id} update={update} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Funding Progress
                </h2>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      ${project.fundingReceived.toLocaleString()} raised
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      ${project.budget.toLocaleString()} goal
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, fundingPercentage)}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    {Math.round(fundingPercentage)}% of goal reached
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    Support This Project
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Project Statistics
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Project Updates
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {project.updates.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Project Partners
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {project.partners.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Project Duration
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.ceil(
                        (new Date().getTime() - new Date(project.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )} days
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}