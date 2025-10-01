import DonationForm from '@/components/donation/DonationForm';

export const metadata = {
  title: 'Donate to BPD Initiatives | Bali Report',
  description: 'Support sustainable development projects across BRICS nations through your contribution to BPD initiatives.',
};

export default function DonatePage() {
  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Support BPD Initiatives
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your contribution helps fund sustainable development projects, from agricultural 
            innovation to renewable energy solutions across BRICS nations.
          </p>
        </div>

        <div className="mt-10">
          <DonationForm />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AgriTech Projects
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Supporting sustainable farming initiatives across Indonesia
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Energy Solutions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Funding renewable energy projects in BRICS communities
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              NGO Development
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Training and empowering local organizations
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            BPD (BRICS Partnership for Development) is committed to transparency in fund allocation.
            20% of all donations directly support community-chosen development projects.
          </p>
        </div>
      </div>
    </div>
  );
}