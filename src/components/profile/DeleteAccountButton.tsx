'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { AlertCircle } from 'lucide-react';

export default function DeleteAccountButton() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect to home page
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsLoading(false);
    }
  };

  if (!isConfirmOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Delete Account</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>
              This action cannot be undone. This will permanently delete your account and remove all
              associated data from our servers.
            </p>
          </div>
          <form onSubmit={handleDelete} className="mt-4">
            {error && (
              <div className="mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-red-700 dark:text-red-300">
                Confirm your password to continue
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-red-600 dark:text-white sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setPassword('');
                  setError('');
                }}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}