import { MOCK_IMPACT_METRICS, MOCK_IMPACT_CATEGORIES, MOCK_TIMELINE_EVENTS } from '@/types/impact';
import ImpactMetricsCard from '@/components/impact/ImpactMetricsCard';
import ImpactCategoryCard from '@/components/impact/ImpactCategoryCard';
import ImpactTimeline from '@/components/impact/ImpactTimeline';

export const metadata = {
  title: 'BPD Impact Dashboard | Bali Report',
  description: 'Track the impact of BPD initiatives and sustainable development projects across BRICS nations.',
};

export default function ImpactDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            BPD Impact Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Track how your support is making a real difference in sustainable development
            across BRICS nations and local communities.
          </p>
        </div>

        <div className="space-y-12">
          {/* Overall Impact Metrics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Overall Impact
            </h2>
            <ImpactMetricsCard metrics={MOCK_IMPACT_METRICS} />
          </section>

          {/* Impact by Category */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Impact by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_IMPACT_CATEGORIES.map(category => (
                <ImpactCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>

          {/* Fund Allocation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Fund Allocation
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue Sources
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">
                          Direct Donations
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ${MOCK_IMPACT_METRICS.totalDonations.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(MOCK_IMPACT_METRICS.totalDonations /
                              (MOCK_IMPACT_METRICS.totalDonations +
                                MOCK_IMPACT_METRICS.totalSubscriptionRevenue)) *
                              100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">
                          Subscription Revenue
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ${MOCK_IMPACT_METRICS.totalSubscriptionRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(MOCK_IMPACT_METRICS.totalSubscriptionRevenue /
                              (MOCK_IMPACT_METRICS.totalDonations +
                                MOCK_IMPACT_METRICS.totalSubscriptionRevenue)) *
                              100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    BPD Allocation
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">
                          Allocated to Projects
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ${MOCK_IMPACT_METRICS.bpdAllocation.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(MOCK_IMPACT_METRICS.bpdAllocation /
                              (MOCK_IMPACT_METRICS.totalDonations +
                                MOCK_IMPACT_METRICS.totalSubscriptionRevenue)) *
                              100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Timeline */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Milestones
            </h2>
            <ImpactTimeline events={MOCK_TIMELINE_EVENTS} />
          </section>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            This dashboard is updated daily with the latest impact metrics from our BPD projects.
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}