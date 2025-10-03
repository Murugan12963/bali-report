import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/metadata';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component with structured data
 * Provides clear navigation hierarchy and SEO benefits
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate structured data for search engines
  const breadcrumbItems = items.map(item => ({
    name: item.name,
    url: `https://bali.report${item.href}`,
  }));

  const schema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual Breadcrumb */}
      <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
        <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {item.current ? (
                <span
                  aria-current="page"
                  className="font-medium text-gray-900 dark:text-gray-100"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Utility function to generate common breadcrumb patterns
 */
export const createBreadcrumbs = {
  homepage: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/', current: true }
  ],

  category: (category: string): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: `${category} News`, href: `/${category.toLowerCase()}`, current: true }
  ],

  search: (query?: string): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: query ? `Search: ${query}` : 'Search', href: '/search', current: true }
  ],

  campaigns: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'BPD Campaigns', href: '/campaigns', current: true }
  ],

  campaign: (campaignTitle: string): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'BPD Campaigns', href: '/campaigns' },
    { name: campaignTitle, href: '#', current: true }
  ],

  communityPicks: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'Community Picks', href: '/community-picks', current: true }
  ],

  saved: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'Saved Articles', href: '/saved', current: true }
  ],

  profile: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'Profile', href: '/profile', current: true }
  ],

  impact: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'Impact Dashboard', href: '/impact', current: true }
  ],

  donation: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'Donate', href: '/donation', current: true }
  ],

  subscription: (): BreadcrumbItem[] => [
    { name: 'Home', href: '/' },
    { name: 'Subscribe', href: '/subscription', current: true }
  ],
};