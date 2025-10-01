'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [imageError, setImageError] = useState(false);

  const percentComplete = Math.round((campaign.raised / campaign.goal) * 100);
  
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const categoryEmoji = {
    agritech: '🌱',
    energy: '⚡',
    ngo: '🎓',
    other: '🌟'
  }[campaign.category];

  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    upcoming: 'bg-yellow-100 text-yellow-800'
  }[campaign.status];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-48 w-full">
        {!imageError && campaign.coverImage ? (
          <Image
            src={campaign.coverImage}
            alt={campaign.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <span className="text-6xl">{categoryEmoji}</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses}`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{categoryEmoji}</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {campaign.title}
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {campaign.description}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">
                ${campaign.raised.toLocaleString()} raised
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                ${campaign.goal.toLocaleString()} goal
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${Math.min(100, percentComplete)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{percentComplete}% Complete</span>
            <span>{daysRemaining} days left</span>
          </div>

          {campaign.status === 'active' && (
            <Link
              href={`/campaigns/${campaign.id}`}
              className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Support This Project
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}