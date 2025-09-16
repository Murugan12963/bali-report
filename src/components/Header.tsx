'use client';

import React from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';

/**
 * Header component with navigation and tropical Bali branding.
 */
const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800 text-white shadow-xl shadow-emerald-500/20 theme-transition">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Site Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all hover:scale-105">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 text-emerald-900 dark:text-teal-900 font-bold text-xl px-3 py-2 rounded-xl shadow-lg theme-transition">
                🏝️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-50">🌺 Bali Report</h1>
                <p className="text-emerald-200 dark:text-teal-200 text-sm theme-transition">🦋 Tropical News Paradise</p>
              </div>
            </Link>
          </div>

          {/* Navigation & Search */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-amber-300 dark:hover:text-amber-200 transition-all hover:scale-105 font-medium text-emerald-100">
                🌊 Home
              </Link>
              <Link href="/brics" className="hover:text-amber-300 dark:hover:text-amber-200 transition-all hover:scale-105 font-medium text-emerald-100">
                🌺 BRICS
              </Link>
              <Link href="/indonesia" className="hover:text-amber-300 dark:hover:text-amber-200 transition-all hover:scale-105 font-medium text-emerald-100">
                🏝️ Indonesia
              </Link>
              <Link href="/bali" className="hover:text-amber-300 dark:hover:text-amber-200 transition-all hover:scale-105 font-medium text-emerald-100">
                ⛩️ Bali
              </Link>
              <Link href="/about" className="hover:text-amber-300 dark:hover:text-amber-200 transition-all hover:scale-105 font-medium text-emerald-100">
                🦋 About
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
              className="text-emerald-100 hover:text-amber-300 dark:hover:text-amber-200 transition-all hover:scale-105"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tropical Mission Banner */}
      <div className="bg-gradient-to-r from-emerald-800/60 via-teal-800/60 to-cyan-800/60 dark:from-emerald-900/60 dark:via-teal-900/60 dark:to-cyan-900/60 border-t border-emerald-500/30 dark:border-teal-600/30 theme-transition backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <p className="text-center text-emerald-100 dark:text-teal-100 text-sm theme-transition">
            🌺 Flowing wisdom from BRICS paradise and Indonesian archipelago • 🌊 Sacred journalism from temple waters
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;