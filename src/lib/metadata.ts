import { Metadata } from 'next';
import { Article } from './rss-parser';

/**
 * Generate metadata for article pages
 */
export function generateArticleMetadata(article: Article): Metadata {
  const title = `${article.title} | Bali Report`;
  const description = article.description.slice(0, 160);
  const url = article.link;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'Bali Report',
      publishedTime: article.pubDate,
      authors: [article.source],
      section: article.category,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    other: {
      'article:publisher': 'Bali Report',
      'article:author': article.source,
      'article:section': article.category || 'News',
      'article:published_time': article.pubDate,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(category: 'BRICS' | 'Indonesia' | 'Bali'): Metadata {
  const descriptions = {
    BRICS: 'Breaking news from BRICS nations - Brazil, Russia, India, China, South Africa. Alternative perspectives on global events from multipolar world leaders.',
    Indonesia: 'Latest news from Indonesia. Coverage of politics, economy, culture, and society from Southeast Asia\'s largest economy.',
    Bali: 'Local news from Bali, Indonesia. Tourism, culture, development, and community updates from the Island of Gods.',
  };

  const keywords = {
    BRICS: 'BRICS news, Russia news, China news, India news, Brazil news, South Africa news, multipolar world, alternative media',
    Indonesia: 'Indonesia news, Jakarta news, Indonesian politics, Southeast Asia news, ASEAN news',
    Bali: 'Bali news, Bali tourism, Bali culture, Ubud news, Denpasar news, Bali development',
  };

  return {
    title: `${category} News`,
    description: descriptions[category],
    keywords: keywords[category],
    openGraph: {
      type: 'website',
      title: `${category} News - Bali Report`,
      description: descriptions[category],
      siteName: 'Bali Report',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} News - Bali Report`,
      description: descriptions[category],
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
