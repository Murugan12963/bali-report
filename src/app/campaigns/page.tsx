import { Metadata } from "next";
import {
  getActiveCampaigns,
  getCampaignStats,
  formatCurrency,
} from "@/lib/campaigns";
import CampaignCard from "@/components/ui/CampaignCard";

export const metadata: Metadata = {
  title: "BPD Fundraising Campaigns",
  description:
    "Support Bali People's Development initiatives through our community-driven fundraising campaigns. 20% of subscription revenue goes directly to BPD projects.",
  openGraph: {
    title: "BPD Fundraising Campaigns - Bali Report",
    description:
      "Support Bali People's Development initiatives through our community-driven fundraising campaigns.",
  },
};

export default function CampaignsPage() {
  const campaigns = getActiveCampaigns();
  const stats = getCampaignStats();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
            🌺 Bali People's Development (BPD)
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-6 max-w-3xl">
            Supporting community-driven development projects across Bali.
            Together, we build a better future.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {formatCurrency(stats.totalRaised)}
              </div>
              <div className="text-sm opacity-80">Total Raised</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{stats.activeCampaigns}</div>
              <div className="text-sm opacity-80">Active Campaigns</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {stats.completedCampaigns}
              </div>
              <div className="text-sm opacity-80">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {stats.beneficiaries.toLocaleString()}
              </div>
              <div className="text-sm opacity-80">Beneficiaries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Allocation Info */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            💡 How BPD Funding Works
          </h2>
          <div className="text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>20% of all subscription revenue</strong> is automatically
              allocated to the BPD fund, supporting community development across
              Bali.
            </p>
            <p>
              Premium subscribers ($2-5/month) enjoy ad-free reading while
              contributing to meaningful local projects. You can also make
              direct donations to specific campaigns below.
            </p>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Active Campaigns
        </h2>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No active campaigns at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>

      {/* How to Support */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">How You Can Support BPD</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold mb-2">Direct Donations</h3>
              <p className="opacity-90">
                Choose a specific campaign and donate directly to causes you
                care about.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-xl font-bold mb-2">Premium Subscription</h3>
              <p className="opacity-90">
                Subscribe for $2-5/month, enjoy ad-free reading, and
                automatically support BPD (20% allocation).
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="text-xl font-bold mb-2">Share & Spread</h3>
              <p className="opacity-90">
                Share campaigns with your network to amplify our impact across
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Our Impact
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Education First
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Completed 3 community library projects serving over 1,500
              students. Providing free access to books, internet, and learning
              resources.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-4">🌿</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Environmental Protection
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Planted 5,000+ mangrove trees along Bali's coastline, protecting
              communities from erosion and restoring marine ecosystems.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
