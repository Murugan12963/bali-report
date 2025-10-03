"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { getCampaignById } from "@/lib/campaigns";
import DonationForm from "@/components/donation/DonationForm";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaign = getCampaignById(params.id as string);

  if (!campaign) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Campaign Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const percentComplete = Math.round((campaign.raised / campaign.goal) * 100);
  const daysRemaining = campaign.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.endDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Details */}
          <div className="lg:col-span-2 space-y-8">
            {campaign.image && (
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {campaign.title}
              </h1>

              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    ${campaign.raised.toLocaleString()} raised of $
                    {campaign.goal.toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {percentComplete}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, percentComplete)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>{daysRemaining} days remaining</span>
                  <span>
                    Campaign ends{" "}
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : "Ongoing"}
                  </span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">
                  About This Project
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {campaign.description}
                </p>

                <h2 className="text-xl font-semibold mb-4">Project Updates</h2>
                <div className="space-y-6">
                  {campaign.updates?.map((update) => (
                    <div
                      key={update.id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {update.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {new Date(update.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {update.content}
                      </p>
                      {update.images && update.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {update.images.map((image, index) => (
                            <div
                              key={index}
                              className="relative h-48 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={image}
                                alt={`Update image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <DonationForm />

              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Impact Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${campaign.raised.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Total Raised
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.ceil(campaign.raised / 1000)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      People Impacted
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.ceil(campaign.raised / 5000)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Communities Served
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
