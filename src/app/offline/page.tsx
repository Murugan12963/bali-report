import Link from "next/link";

/**
 * Offline page for PWA when network is unavailable.
 * Beautiful tropical-themed offline experience.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-emerald-900/10 theme-transition">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Tropical Offline Hero */}
          <div className="mb-12">
            <div className="text-8xl mb-6">🏝️</div>
            <h1 className="text-4xl md:text-5xl font-bold text-teal-900 dark:text-teal-100 mb-4 theme-transition">
              Sacred Island Mode
            </h1>
            <p className="text-xl text-teal-700 dark:text-teal-300 mb-8 theme-transition">
              Like a peaceful temple retreat, you're temporarily disconnected
              from the digital world. But the wisdom of paradise remains with
              you.
            </p>
          </div>

          {/* Offline Features */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-emerald-200/50 dark:border-emerald-700/50 mb-8 theme-transition">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-6 theme-transition">
              🌺 Available in Paradise Mode
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 theme-transition">
                  Cached Articles
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400 theme-transition">
                  Recently viewed articles are still available for reading
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">💾</div>
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 theme-transition">
                  Saved for Later
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400 theme-transition">
                  Your bookmarked articles are always accessible
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 theme-transition">
                  Search Cache
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400 theme-transition">
                  Search through your cached content
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-3">🌙</div>
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 theme-transition">
                  Theme Switch
                </h3>
                <p className="text-sm text-teal-600 dark:text-teal-400 theme-transition">
                  Dark/light mode works offline too
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg inline-flex items-center justify-center"
              >
                🌊 Try Homepage Again
              </Link>

              <Link
                href="/saved"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg inline-flex items-center justify-center"
              >
                💾 View Saved Articles
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              <Link
                href="/brics"
                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors theme-transition"
              >
                🌺 BRICS
              </Link>
              <Link
                href="/indonesia"
                className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors theme-transition"
              >
                🏝️ Indonesia
              </Link>
              <Link
                href="/bali"
                className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors theme-transition"
              >
                ⛩️ Bali
              </Link>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-12 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg theme-transition">
            <div className="flex items-center justify-center text-amber-800 dark:text-amber-200 theme-transition">
              <div className="animate-pulse mr-2">🔄</div>
              <span className="text-sm">
                Watching for connection to paradise servers...
              </span>
            </div>
          </div>

          {/* Tropical Quote */}
          <div className="mt-8 italic text-teal-600 dark:text-teal-400 theme-transition">
            <p>
              "Like the eternal flow of Bali's sacred rivers, news will return
              when the time is right. Until then, find peace in the wisdom
              already gathered."
            </p>
            <p className="text-sm mt-2">
              — Ancient Balinese Proverb (probably) 🌸
            </p>
          </div>
        </div>
      </main>

      {/* Tropical Footer */}
      <footer className="bg-gradient-to-r from-teal-900/80 via-emerald-900/80 to-cyan-900/80 text-white py-6 mt-12 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-emerald-200">
            <span>🌺</span>
            <span>Offline mode powered by sacred temple technology</span>
            <span>🏝️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
