"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeSwitcher from "./ThemeSwitcher";
import { PushNotificationButton } from "./pwa/PushNotificationManager";

/**
 * Clean, modern Header component
 */
const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        !(e.target as Element).closest(".mobile-menu-container")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClass =
    "relative px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200";

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl theme-transition sticky top-0 z-50">
      {/* Top accent line */}

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Futuristic Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 group"
            >
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-teal-600 dark:to-teal-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden">
                <span className="text-white font-bold text-sm relative z-10">
                  BR
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-teal-400 group-hover:text-blue-600 dark:group-hover:text-teal-300 transition-colors duration-200 tracking-tight">
                  Bali Report
                </h1>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-[0.15em]">
                  News Without Borders
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-1">
              <Link href="/opinion" className={navLinkClass}>
                📰 Opinion
              </Link>
              <Link href="/about" className={navLinkClass}>
                ℹ️ About
              </Link>
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
              <Link href="/brics" className={navLinkClass}>
                BRICS
              </Link>
              <Link href="/indonesia" className={navLinkClass}>
                Indonesia
              </Link>
              <Link href="/bali" className={navLinkClass}>
                Bali
              </Link>
              <Link href="/events" className={navLinkClass}>
                Events
              </Link>
              <Link href="/videos" className={navLinkClass}>
                Videos
              </Link>
              <Link href="/saved" className={navLinkClass}>
                Saved
              </Link>
              <Link href="/subscription" className={navLinkClass}>
                Premium
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="w-80">
              <SearchBar placeholder="Search uncensored news..." />
            </div>

            {/* PWA Features */}
            <div className="flex items-center space-x-2">
              <PushNotificationButton />
              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2 mobile-menu-container">
            <ThemeSwitcher />
            <button
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-5 h-5 transform transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl mobile-menu-container animate-fade-in-up">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="w-full">
              <SearchBar placeholder="Search uncensored news..." />
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🏠 Home
              </Link>
              <Link
                href="/brics"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🌍 BRICS
              </Link>
              <Link
                href="/indonesia"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🇮🇩 Indonesia
              </Link>
              <Link
                href="/bali"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🏝️ Bali
              </Link>
              <Link
                href="/events"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                🎉 Events
              </Link>
              <Link
                href="/videos"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                📺 Videos
              </Link>
              <Link
                href="/opinion"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                💭 Opinion
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                ℹ️ About
              </Link>
              <Link
                href="/saved"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                💾 Saved
              </Link>
              <Link
                href="/subscription"
                className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200"
                onClick={closeMobileMenu}
              >
                ⭐ Premium
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
