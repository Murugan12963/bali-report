import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import UserProfileForm from '@/components/profile/UserProfileForm';
import UserPreferencesForm from '@/components/profile/UserPreferencesForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import DeleteAccountButton from '@/components/profile/DeleteAccountButton';

export const metadata: Metadata = {
  title: 'Profile - Bali Report',
  description: 'Manage your Bali Report profile and preferences',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>

          <div className="mt-6 space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Personal Information
                </h2>
                <UserProfileForm user={session.user} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Content Preferences
                </h2>
                <UserPreferencesForm preferences={session.user.preferences} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Security Settings
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Update your password to keep your account secure
                    </p>
                    <div className="mt-3">
                      <ChangePasswordForm />
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete Account</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all associated data
                    </p>
                    <div className="mt-3">
                      <DeleteAccountButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}