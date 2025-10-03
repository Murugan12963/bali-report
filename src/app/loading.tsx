export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 theme-transition">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Loading Latest News...
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-2">
            Fetching articles from 9 global sources
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            This may take a few moments as we aggregate the latest stories
          </p>
        </div>
      </main>
    </div>
  );
}
