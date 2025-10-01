'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { useRouter } from 'next/navigation';

const DonationFormContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedAmounts = ['5', '10', '25', '50', '100'];

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
      // a payment intent and process the payment
      // For now, we'll just show a success message
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/donation/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support BPD Initiatives</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your donation helps fund sustainable development projects across BRICS nations.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose Amount (USD)
          </label>
          <div className="grid grid-cols-3 gap-2 my-2">
            {predefinedAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`p-2 text-sm border rounded ${
                  amount === preset
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              min="1"
              step="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Details
          </label>
          <div className="p-3 border rounded focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
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
          disabled={!stripe || isProcessing || !amount}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (!stripe || isProcessing || !amount) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Processing...' : `Donate $${amount || '0'}`}
        </button>
      </div>
    </form>
  );
};

export default function DonationForm() {
  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent />
    </Elements>
  );
}