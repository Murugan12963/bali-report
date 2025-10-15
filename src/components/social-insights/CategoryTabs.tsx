'use client';

/**
 * Category Tabs Component
 * Navigation tabs for switching between BRICS, Indonesia, and Bali insights
 */

type Category = 'BRICS' | 'Indonesia' | 'Bali';

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  loading?: boolean;
}

const categoryConfig = {
  BRICS: {
    label: 'BRICS',
    icon: '🌍',
    description: 'Global partnerships & multipolarity',
    color: 'emerald'
  },
  Indonesia: {
    label: 'Indonesia',
    icon: '🇮🇩',
    description: 'National developments & economy',
    color: 'red'
  },
  Bali: {
    label: 'Bali',
    icon: '🏝️',
    description: 'Local events & sustainable tourism',
    color: 'orange'
  }
};

export default function CategoryTabs({ activeCategory, onCategoryChange, loading = false }: CategoryTabsProps) {
  return (
    <div className="w-full">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <label htmlFor="category-select" className="sr-only">
          Choose category
        </label>
        <select
          id="category-select"
          className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-teal-500 focus:ring-teal-500"
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          disabled={loading}
        >
          {Object.entries(categoryConfig).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.label} - {config.description}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <nav className="flex space-x-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const isActive = key === activeCategory;
            const category = key as Category;
            
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(category)}
                disabled={loading}
                className={`
                  relative flex-1 flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 min-w-0
                  ${isActive
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-700/50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {loading && isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                <div className={`flex items-center gap-3 ${loading && isActive ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="text-lg" role="img" aria-label={config.label}>
                    {config.icon}
                  </span>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold truncate">
                      {config.label}
                    </div>
                    <div className="text-xs opacity-75 truncate">
                      {config.description}
                    </div>
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div 
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full bg-${config.color}-500`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Category Description */}
        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {categoryConfig[activeCategory].label}:
            </span>{' '}
            {categoryConfig[activeCategory].description}
          </p>
        </div>
      </div>
    </div>
  );
}