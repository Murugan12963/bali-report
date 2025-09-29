'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';

/**
 * Header component with Grok-inspired modern navigation and branding.
 */
const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen && !(e.target as Element).closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl theme-transition sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Modern Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-75 transition-all duration-200 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <span className="text-white font-bold text-sm">BR</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Bali Report</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">News Without Borders</p>
              </div>
            </Link>
          </div>

          {/* Modern Navigation & Search */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Home
              </Link>
              <Link href="/brics" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                BRICS
              </Link>
              <Link href="/indonesia" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Indonesia
              </Link>
              <Link href="/bali" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Bali
              </Link>
              <Link href="/saved" className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200">
                Saved
              </Link>
            </nav>
            
            {/* Search Bar */}
            <div className="w-80">
              <SearchBar placeholder="Search uncensored news..." />
            </div>
            
            {/* Theme Switcher */}
            <ThemeSwitcher className="ml-2" />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2 mobile-menu-container">
            <ThemeSwitcher />
            <button
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={toggleMobileMenu}
            >
              <svg className="w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl mobile-menu-container">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="w-full">
              <SearchBar placeholder="Search uncensored news..." />
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🏠 Home
              </Link>
              <Link 
                href="/brics" 
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🌍 BRICS
              </Link>
              <Link 
                href="/indonesia" 
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🇮🇩 Indonesia
              </Link>
              <Link 
                href="/bali" 
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🏝️ Bali
              </Link>
              <Link 
                href="/saved" 
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                💾 Saved
              </Link>
            </nav>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;