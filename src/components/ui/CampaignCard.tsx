'use client';

import { Campaign } from '@/types/campaign';
import { getCampaignProgress, formatCurrency } from '@/lib/campaigns';
import DonationButton from './DonationButton';

interface CampaignCardProps {
  campaign: Campaign;
  showDonateButton?: boolean;
}

export default function CampaignCard({ campaign, showDonateButton = true }: CampaignCardProps) {
  const progress = getCampaignProgress(campaign);
  const remainingDays = campaign.endDate
    ? Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const categoryColors = {
    education: 'from-blue-500 to-indigo-600',
    healthcare: 'from-red-500 to-pink-600',
    infrastructure: 'from-gray-500 to-slate-600',
    environment: 'from-green-500 to-emerald-600',
    community: 'from-purple-500 to-violet-600',
  };

  const categoryEmojis = {
    education: '📚',
    healthcare: '🏥',
    infrastructure: '🏗️',
    environment: '🌿',
    community: '🤝',
  };

  const gradientClass = categoryColors[campaign.category] || 'from-teal-500 to-cyan-600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      {/* Campaign Image */}
      {campaign.image && (
        <div className="relative h-48 bg-gradient-to-br overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">{categoryEmojis[campaign.category]}</span>
          </div>

          {/* Status Badge */}
          {campaign.status === 'completed' && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ✅ Completed
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Category & Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="capitalize font-medium">{campaign.category}</span>
          {campaign.location && (
            <>
              <span>•</span>
              <span>📍 {campaign.location}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {campaign.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(campaign.raised, campaign.currency)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              of {formatCurrency(campaign.goal, campaign.currency)}
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              {progress.toFixed(0)}% funded
            </span>
            {remainingDays !== null && remainingDays > 0 && (
              <span className="text-gray-600 dark:text-gray-400">
                {remainingDays} days left
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        {campaign.beneficiaries && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span>👥 {campaign.beneficiaries.toLocaleString()} beneficiaries</span>
          </div>
        )}

        {/* Donate Button */}
        {showDonateButton && campaign.status === 'active' && (
          <DonationButton campaign={campaign} />
        )}

        {/* Completed Message */}
        {campaign.status === 'completed' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
            <p className="text-green-700 dark:text-green-300 font-semibold">
              🎉 Campaign successfully completed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
