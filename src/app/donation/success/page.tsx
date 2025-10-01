'use client';

import Link from 'next/link';

export default function DonationSuccess() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center space-y-6">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Thank You for Your Donation!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your contribution will help support sustainable development projects across BRICS nations.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/projects"
            className="block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            View BPD Projects
          </Link>
        </div>
      </div>
    </div>
  );
}