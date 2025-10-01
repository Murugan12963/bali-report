'use client';

import Link from 'next/link';

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center space-y-6">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Premium!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Thank you for subscribing. Your support helps fund sustainable development projects 
          across BRICS nations while giving you access to exclusive content and features.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h2 className="font-semibold text-blue-900 dark:text-blue-200">
            What's Next?
          </h2>
          <ul className="mt-2 text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <li>✓ Ad-free experience is now active</li>
            <li>✓ Access to exclusive Bali event guides</li>
            <li>✓ Early access to upcoming webinars</li>
            <li>✓ Premium BRICS analysis content</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/events"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Browse Exclusive Events
          </Link>
          <Link
            href="/analysis"
            className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Read Premium Analysis
          </Link>
          <Link
            href="/"
            className="block w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors"
          >
            Return Home
          </Link>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Check your email for your subscription confirmation and receipt.
            Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}