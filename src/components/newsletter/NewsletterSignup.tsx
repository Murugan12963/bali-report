'use client';

import { useState } from 'react';
import { SubscribeData } from '@/lib/mailchimp';

interface NewsletterSignupProps {
  variant?: 'default' | 'inline' | 'floating';
  onSubscribe: (data: SubscribeData) => Promise<{ success: boolean; message: string }>;
}

export default function NewsletterSignup({ 
  variant = 'default',
  onSubscribe 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showExtended, setShowExtended] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const result = await onSubscribe({ 
        email, 
        firstName,
        source: 'newsletter_signup',
        interests: ['tropical-news', 'brics-updates']
      });

      setStatus(result.success ? 'success' : 'error');
      setMessage(result.message);

      if (result.success) {
        setEmail('');
        setFirstName('');
        setShowExtended(false);
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    }
  };

  const variantStyles = {
    default: 'max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg',
    inline: 'w-full',
    floating: 'fixed bottom-4 right-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm'
  };

  return (
    <div className={variantStyles[variant]}>
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Stay Updated 🌊
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Subscribe to get tropical insights and BRICS news delivered to your inbox!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
            onFocus={() => setShowExtended(true)}
          />
        </div>

        {showExtended && (
          <div className="animate-fade-in">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name (optional)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            status === 'loading'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}