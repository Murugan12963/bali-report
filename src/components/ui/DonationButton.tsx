'use client';

import { useState } from 'react';
import { Campaign } from '@/types/campaign';
import { trackConversion } from '@/lib/analytics/matomo';

interface DonationButtonProps {
  campaign: Campaign;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function DonationButton({
  campaign,
  variant = 'primary',
  size = 'md'
}: DonationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const presetAmounts = [10, 25, 50, 100];

  const handleDonate = async (amount: number) => {
    setIsLoading(true);

    try {
      // TODO: Integrate with Stripe Checkout
      // 1. Create Stripe Checkout Session with campaign metadata
      // 2. Redirect to Stripe hosted checkout page
      // 3. Handle success/cancel redirects

      // Example Stripe integration:
      /*
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          campaignId: campaign.id,
          type: 'donation',
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
      */

      // Track donation intent
      trackConversion('donation', amount);

      console.log(`💰 Donating $${amount} to campaign: ${campaign.title}`);

      // Mock success
      alert(`Thank you for your donation of $${amount} to ${campaign.title}!\n\nThis is a demo. Stripe integration will be completed in production.`);

      setShowAmountModal(false);
      setCustomAmount('');
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const buttonClass = `
    w-full font-semibold rounded-lg transition-all duration-200
    ${variant === 'primary'
      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
      : 'bg-white dark:bg-gray-800 border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-700'
    }
    ${sizeClasses[size]}
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <>
      <button
        onClick={() => setShowAmountModal(true)}
        className={buttonClass}
        disabled={isLoading || campaign.status !== 'active'}
      >
        {isLoading ? '⏳ Processing...' : '💖 Donate Now'}
      </button>

      {/* Amount Selection Modal */}
      {showAmountModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAmountModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Support {campaign.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your donation helps make a difference
                </p>
              </div>
              <button
                onClick={() => setShowAmountModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDonate(amount)}
                  disabled={isLoading}
                  className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Amount (USD)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full pl-7 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    const amount = parseFloat(customAmount);
                    if (amount > 0) {
                      handleDonate(amount);
                    }
                  }}
                  disabled={isLoading || !customAmount || parseFloat(customAmount) <= 0}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  Donate
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>20% of subscription revenue</strong> automatically goes to BPD initiatives.
                Direct donations fund specific campaigns.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
