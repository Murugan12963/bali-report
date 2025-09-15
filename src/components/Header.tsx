'use client';

import React from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';

/**
 * Header component with navigation and BRICS branding.
 */
const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-red-700 to-red-800 dark:from-red-800 dark:to-red-900 text-white shadow-lg theme-transition">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Site Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-yellow-500 dark:bg-yellow-400 text-red-800 dark:text-red-900 font-bold text-xl px-3 py-2 rounded-lg theme-transition">
                BR
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bali Report</h1>
                <p className="text-red-200 dark:text-red-300 text-sm theme-transition">Multi-polar News Perspective</p>
              </div>
            </Link>
          </div>

          {/* Navigation & Search */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors font-medium">
                Home
              </Link>
              <Link href="/brics" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors font-medium">
                BRICS
              </Link>
              <Link href="/indonesia" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors font-medium">
                Indonesia
              </Link>
              <Link href="/bali" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors font-medium">
                Bali
              </Link>
              <Link href="/about" className="hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors font-medium">
                About
              </Link>
            </nav>
            
            {/* Theme Switcher */}
            <ThemeSwitcher className="mr-2" />
            
            {/* Search Bar */}
            <div className="w-72">
              <SearchBar placeholder="Search news..." />
            </div>
          </div>

          {/* Mobile Menu Button & Theme Switcher */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeSwitcher />
            <button
              className="text-white hover:text-yellow-300 dark:hover:text-yellow-200 transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mission Statement Banner */}
      <div className="bg-red-800/50 dark:bg-red-900/50 border-t border-red-600 dark:border-red-700 theme-transition">
        <div className="container mx-auto px-4 py-2">
          <p className="text-center text-red-100 dark:text-red-200 text-sm theme-transition">
            🌍 Bringing you perspectives from BRICS nations and Indonesian insights • Fighting Western media monopoly
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;