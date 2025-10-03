"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Modern, clean search bar component
 */
interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search articles...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-20 py-2.5
            bg-white dark:bg-zinc-900
            border border-gray-300 dark:border-zinc-700
            rounded-lg
            text-gray-900 dark:text-zinc-100
            placeholder-gray-500 dark:placeholder-zinc-400
            text-sm
            transition-all duration-200
            focus:outline-none
            focus:border-blue-500 dark:focus:border-teal-500
            focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-teal-500/20
            shadow-sm hover:shadow-md
          `}
        />

        <div
          className={`
          absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none
          transition-colors duration-200
          ${isFocused ? "text-blue-500 dark:text-teal-500" : "text-gray-400 dark:text-zinc-400"}
        `}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          type="submit"
          className={`
            absolute right-1 top-1 bottom-1 px-4
            bg-blue-600 hover:bg-blue-700
            dark:bg-teal-600 dark:hover:bg-teal-500
            text-white
            rounded-md
            transition-all duration-200
            font-medium text-xs uppercase tracking-wider
            shadow-sm
          `}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
