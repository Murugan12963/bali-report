'use client';

import { useState } from 'react';
import CampaignCard from '@/components/campaign/CampaignCard';
import { Campaign, CampaignFilters, MOCK_CAMPAIGNS } from '@/types/campaign';

export default function CampaignsPage() {
  const [filters, setFilters] = useState<CampaignFilters>({});

  const categories: Campaign['category'][] = ['agritech', 'energy', 'ngo', 'other'];
  const statuses: Campaign['status'][] = ['active', 'completed', 'upcoming'];

  const filteredCampaigns = MOCK_CAMPAIGNS.filter(campaign => {
    if (filters.category && campaign.category !== filters.category) {
      return false;
    }
    if (filters.status && campaign.status !== filters.status) {
      return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalRaised = filteredCampaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            BPD Fundraising Campaigns
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Support sustainable development projects across BRICS nations. Choose from various
            initiatives in agriculture, energy, and community development.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ${totalRaised.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Total Raised</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {activeCampaigns}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Active Campaigns</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {filteredCampaigns.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Total Projects</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                3
              </div>
              <div className="text-gray-600 dark:text-gray-300">Countries Impacted</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: (e.target.value || undefined) as Campaign['category']
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: (e.target.value || undefined) as Campaign['status']
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  searchQuery: e.target.value || undefined
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No campaigns found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}