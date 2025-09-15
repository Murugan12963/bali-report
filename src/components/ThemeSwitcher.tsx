'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

/**
 * Theme switcher component with smooth animations and multiple theme options.
 */
interface ThemeSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className = '', 
  showLabel = false,
  variant = 'button'
}) => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Safe theme hook usage with fallbacks
  let theme: 'light' | 'dark' | 'system' = 'system';
  let effectiveTheme: 'light' | 'dark' = 'light';
  let setTheme: (theme: 'light' | 'dark' | 'system') => void = () => {};
  let toggleTheme: () => void = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    effectiveTheme = themeContext.effectiveTheme;
    setTheme = themeContext.setTheme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // Fallback for server-side rendering or missing provider
    if (typeof window !== 'undefined') {
      console.warn('ThemeProvider not available, using fallback theme');
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={`w-10 h-10 bg-gray-200 rounded-lg animate-pulse ${className}`} />
    );
  }

  /**
   * Get theme icon based on current theme.
   * 
   * Args:
   *   themeType (string): Theme type to get icon for.
   * 
   * Returns:
   *   JSX.Element: Theme icon component.
   */
  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  /**
   * Get theme display name.
   * 
   * Args:
   *   themeType (string): Theme type to get name for.
   * 
   * Returns:
   *   string: Human-readable theme name.
   */
  const getThemeName = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return themeType;
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          group relative p-2 rounded-lg transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          hover:border-gray-300 dark:hover:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          active:scale-95 transform
          shadow-sm hover:shadow-md
          ${className}
        `}
        title={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} mode`}
        aria-label="Toggle theme"
      >
        <div className="relative w-5 h-5">
          {/* Light mode icon */}
          <div className={`
            absolute inset-0 transition-all duration-300 transform
            ${effectiveTheme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
            }
          `}>
            <div className="text-amber-500">
              {getThemeIcon('light')}
            </div>
          </div>
          
          {/* Dark mode icon */}
          <div className={`
            absolute inset-0 transition-all duration-300 transform
            ${effectiveTheme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
            }
          `}>
            <div className="text-blue-400">
              {getThemeIcon('dark')}
            </div>
          </div>
        </div>
        
        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {getThemeName(effectiveTheme)}
          </span>
        )}
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group relative p-2 rounded-lg transition-all duration-300 ease-in-out
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700
          hover:border-gray-300 dark:hover:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          shadow-sm hover:shadow-md
        `}
        title="Change theme"
        aria-label="Theme options"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2">
          <div className={`
            text-gray-600 dark:text-gray-400 transition-colors
            ${effectiveTheme === 'light' ? 'text-amber-500' : ''}
            ${effectiveTheme === 'dark' ? 'text-blue-400' : ''}
          `}>
            {getThemeIcon(theme)}
          </div>
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getThemeName(theme)}
            </span>
          )}
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`
          absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-lg z-50
          transform transition-all duration-200 ease-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}>
          <div className="py-1">
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => {
                  setTheme(themeOption);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left flex items-center space-x-3
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-colors duration-150
                  ${theme === themeOption 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <div className={`
                  ${theme === themeOption && themeOption === 'light' ? 'text-amber-500' : ''}
                  ${theme === themeOption && themeOption === 'dark' ? 'text-blue-400' : ''}
                  ${theme === themeOption && themeOption === 'system' ? 'text-green-500' : ''}
                `}>
                  {getThemeIcon(themeOption)}
                </div>
                <span className="text-sm font-medium">
                  {getThemeName(themeOption)}
                </span>
                {theme === themeOption && (
                  <svg className="w-4 h-4 ml-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;