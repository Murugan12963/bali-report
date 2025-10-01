'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { SubscriptionPlan, SUBSCRIPTION_PLANS, SUBSCRIPTION_FEATURES } from '@/types/subscription';

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
}

const PlanCard = ({ plan, isSelected, onSelect }: PlanCardProps) => {
  return (
    <div
      className={`relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all ${
        isSelected
          ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20'
          : 'border-transparent'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{plan.description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
          <span className="text-gray-600 dark:text-gray-300">/{plan.interval}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-6 w-6 text-green-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <button
          onClick={onSelect}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </button>
      </div>
    </div>
  );
};

const PaymentForm = ({ selectedPlan }: { selectedPlan: SubscriptionPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: cardError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (cardError) {
        throw new Error(cardError.message);
      }

      // Here we would typically make a call to our backend to create
      // a subscription and process the payment
      // For now, we'll just show a success message
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/subscription/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Details
        </label>
        <div className="p-3 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          (!stripe || isProcessing) && 'opacity-50 cursor-not-allowed'
        }`}
      >
        {isProcessing ? 'Processing...' : `Subscribe - $${selectedPlan.price}/${selectedPlan.interval}`}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time.
      </p>
    </form>
  );
};

const PlanComparison = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    SUBSCRIPTION_PLANS.find(plan => plan.popular) || null
  );

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Choose Your Subscription Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Support BPD projects while enjoying an enhanced reading experience
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </div>

        {selectedPlan && (
          <div className="mt-12 max-w-lg mx-auto">
            <Elements stripe={stripePromise}>
              <PaymentForm selectedPlan={selectedPlan} />
            </Elements>
          </div>
        )}

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Compare Features
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b dark:border-gray-700">
                  <th className="py-4 px-6 text-left text-gray-500 dark:text-gray-400">Feature</th>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <th key={plan.id} className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBSCRIPTION_FEATURES.map(feature => (
                  <tr key={feature.id} className="border-b dark:border-gray-700">
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {feature.name}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </div>
                    </td>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <td key={plan.id} className="py-4 px-6 text-center">
                        {feature.includedIn.includes(plan.id as any) ? (
                          <svg
                            className="h-6 w-6 text-green-500 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;