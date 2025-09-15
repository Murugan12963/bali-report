import { MetadataRoute } from 'next';

/**
 * Generate dynamic sitemap for SEO.
 * 
 * Returns:
 *   MetadataRoute.Sitemap: Sitemap configuration for search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bali.report';
  const currentDate = new Date();
  
  return [
    // Homepage - highest priority, updated frequently
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    // Main category pages - high priority, updated frequently  
    {
      url: `${baseUrl}/brics`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/indonesia`,
      lastModified: currentDate,
      changeFrequency: 'hourly', 
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bali`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Search page - medium priority
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // About page - low priority, rarely changes
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}