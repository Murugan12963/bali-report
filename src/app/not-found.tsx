import Link from 'next/link';

/**
 * 404 Not Found page with BRICS theme styling.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Simple header without ThemeSwitcher for static generation */}
      <header className="bg-gradient-to-r from-red-700 to-red-800 dark:from-red-800 dark:to-red-900 text-white shadow-lg theme-transition">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-yellow-500 dark:bg-yellow-400 text-red-800 dark:text-red-900 font-bold text-xl px-3 py-2 rounded-lg">
                BR
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bali Report</h1>
                <p className="text-red-200 dark:text-red-300 text-sm">Multi-polar News Perspective</p>
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-red-600 dark:text-red-400 mb-4">404</div>
            <div className="text-6xl mb-6">🗞️</div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 theme-transition">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 theme-transition">
            Sorry, we couldn&apos;t find the news article or page you&apos;re looking for. 
            It may have been moved, deleted, or you may have entered an incorrect URL.
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Homepage
            </Link>
            
            <Link
              href="/search"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors theme-transition"
            >
              <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Articles
            </Link>
          </div>
          
          {/* Popular Links */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 theme-transition">
              Popular Sections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                href="/brics" 
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow theme-transition"
              >
                <div className="text-red-600 dark:text-red-400 font-semibold">🌍 BRICS News</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Global multipolar perspectives
                </div>
              </Link>
              
              <Link 
                href="/indonesia" 
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow theme-transition"
              >
                <div className="text-yellow-600 dark:text-yellow-400 font-semibold">🇮🇩 Indonesia</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Southeast Asian insights
                </div>
              </Link>
              
              <Link 
                href="/bali" 
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow theme-transition"
              >
                <div className="text-amber-600 dark:text-amber-400 font-semibold">🏝️ Bali Local</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Island of the Gods coverage
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}