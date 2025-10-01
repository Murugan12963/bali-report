'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentPreference, UserPreferences } from '@/types/user';

interface UserPreferencesFormProps {
  preferences: UserPreferences;
}

const CONTENT_CATEGORIES: { value: ContentPreference; label: string }[] = [
  { value: 'brics', label: 'BRICS Global News' },
  { value: 'indonesia', label: 'Indonesia News' },
  { value: 'bali', label: 'Bali Local News' },
  { value: 'economy', label: 'Economy & Trade' },
  { value: 'politics', label: 'Politics & Diplomacy' },
  { value: 'culture', label: 'Culture & Society' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
];

export default function UserPreferencesForm({ preferences }: UserPreferencesFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UserPreferences>(preferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update preferences');
      }

      setSuccessMessage('Preferences updated successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContentPreference = (preference: ContentPreference) => {
    setFormData(prev => {
      const current = prev.contentPreferences || [];
      const updated = current.includes(preference)
        ? current.filter(p => p !== preference)
        : [...current, preference];
      return { ...prev, contentPreferences: updated };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Categories</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the types of content you're interested in
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTENT_CATEGORIES.map(category => (
            <label
              key={category.value}
              className={`relative flex items-center px-4 py-3 border rounded-lg cursor-pointer focus:outline-none ${
                formData.contentPreferences?.includes(category.value)
                  ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-700'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={formData.contentPreferences?.includes(category.value)}
                onChange={() => toggleContentPreference(category.value)}
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                {category.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              id="darkMode"
              type="checkbox"
              checked={formData.darkMode}
              onChange={e => setFormData(prev => ({ ...prev, darkMode: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="darkMode" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Use dark mode
            </label>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Language
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={e => setFormData(prev => ({ ...prev, language: e.target.value as 'en' | 'id' }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="emailNotifications"
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={e => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Receive email notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="pushNotifications"
              type="checkbox"
              checked={formData.pushNotifications}
              onChange={e => setFormData(prev => ({ ...prev, pushNotifications: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="pushNotifications" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable push notifications
            </label>
          </div>

          <div>
            <label htmlFor="articleDisplay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Article Display
            </label>
            <select
              id="articleDisplay"
              value={formData.articleDisplay}
              onChange={e => setFormData(prev => ({ ...prev, articleDisplay: e.target.value as 'compact' | 'comfortable' }))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save preferences'}
        </button>
      </div>
    </form>
  );
}