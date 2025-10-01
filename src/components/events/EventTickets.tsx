'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { useRouter } from 'next/navigation';
import { EventTicket } from '@/types/event';

interface EventTicketsProps {
  tickets: EventTicket[];
  eventTitle: string;
}

const TicketPurchaseForm = ({
  selectedTicket,
  onCancel
}: {
  selectedTicket: EventTicket;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxQuantity = Math.min(10, selectedTicket.availableCount);

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

      // Here we would typically make a call to our backend to process the payment
      // and create the ticket records
      // For now, we'll just simulate success
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/events/purchase-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of Tickets
        </label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
        >
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'ticket' : 'tickets'} (${(num * selectedTicket.price).toLocaleString()})
            </option>
          ))}
        </select>
      </div>

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

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (!stripe || isProcessing) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isProcessing
            ? 'Processing...'
            : `Purchase - $${(quantity * selectedTicket.price).toLocaleString()}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By purchasing tickets, you agree to our Terms of Service and Event Policies.
      </p>
    </form>
  );
};

const TicketOption = ({
  ticket,
  onSelect
}: {
  ticket: EventTicket;
  onSelect: () => void;
}) => {
  const isSoldOut = ticket.soldCount >= ticket.availableCount;
  const remainingTickets = ticket.availableCount - ticket.soldCount;
  const isLowAvailability = remainingTickets <= 10;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} Ticket
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {ticket.description}
          </p>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          ${ticket.price}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          What's included:
        </h4>
        <ul className="space-y-2">
          {ticket.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
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
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {!isSoldOut && isLowAvailability && (
          <p className="text-orange-600 dark:text-orange-400 text-sm mb-2">
            Only {remainingTickets} tickets remaining!
          </p>
        )}
        <button
          onClick={onSelect}
          disabled={isSoldOut}
          className={`w-full py-2 px-4 rounded-md text-white ${
            isSoldOut
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSoldOut ? 'Sold Out' : 'Select'}
        </button>
      </div>
    </div>
  );
};

export default function EventTickets({ tickets, eventTitle }: EventTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Select Your Tickets
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          for {eventTitle}
        </p>
      </div>

      {selectedTicket ? (
        <div className="max-w-md mx-auto">
          <Elements stripe={stripePromise}>
            <TicketPurchaseForm
              selectedTicket={selectedTicket}
              onCancel={() => setSelectedTicket(null)}
            />
          </Elements>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <TicketOption
              key={ticket.id}
              ticket={ticket}
              onSelect={() => setSelectedTicket(ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
}