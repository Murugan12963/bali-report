import PlanComparison from '@/components/subscription/PlanComparison';

export const metadata = {
  title: 'Premium Subscriptions | Bali Report',
  description: 'Choose your premium subscription plan and support BPD initiatives while enjoying exclusive content and features.',
};

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Premium Subscriptions
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Support sustainable development across BRICS nations while enjoying exclusive content,
            early access to events, and an enhanced reading experience.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">20-30%</div>
              <div className="text-gray-600 dark:text-gray-300">
                Of subscription revenue allocated to BPD projects
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">12+</div>
              <div className="text-gray-600 dark:text-gray-300">
                Active development projects supported
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">5000+</div>
              <div className="text-gray-600 dark:text-gray-300">
                People impacted by BPD initiatives
              </div>
            </div>
          </div>
        </div>

        <PlanComparison />

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                How is my subscription fee allocated?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                20-30% of your subscription fee (depending on your plan) goes directly to BPD
                development projects. The remaining funds help us maintain and improve our platform,
                produce quality content, and expand our coverage.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Can I cancel my subscription?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Yes, you can cancel your subscription at any time. Your benefits will continue until
                the end of your current billing period. No refunds are provided for partial months.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                What payment methods do you accept?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                We accept all major credit cards (Visa, MasterCard, American Express) and select
                payment methods through Stripe's secure payment processing.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                How can I track my BPD impact?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Premium subscribers get access to our Impact Dashboard where you can track how your
                subscription fee is being used, view project updates, and see the real-world impact
                of BPD initiatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}