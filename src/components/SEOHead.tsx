import { Metadata } from 'next';

/**
 * SEO component with structured data and enhanced meta tags.
 */
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  articleAuthor?: string;
  articleSection?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}

/**
 * Generate comprehensive metadata for SEO optimization.
 * 
 * Args:
 *   props (SEOProps): SEO configuration options.
 * 
 * Returns:
 *   Metadata: Next.js metadata object.
 */
export function generateSEOMetadata({
  title = 'Bali Report - Multi-polar News Perspectives',
  description = 'Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights. Breaking free from Western media monopoly with real-time RSS feeds from 400+ articles daily.',
  keywords = 'BRICS news, Indonesia news, alternative media, multipolar, Russia, China, India, Brazil, South Africa, Southeast Asia, Bali local news',
  canonical = 'https://bali.report',
  ogType = 'website',
  articleAuthor,
  articleSection,
  articlePublishedTime,
  articleModifiedTime
}: SEOProps = {}): Metadata {
  const baseUrl = 'https://bali.report';
  
  const metadata: Metadata = {
    title,
    description,
    keywords,
    authors: [{ name: 'Bali Report' }],
    creator: 'Bali Report',
    publisher: 'Bali Report',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonical,
      siteName: 'Bali Report',
      title,
      description,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
      creator: '@BaliReport'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    category: 'news',
    classification: 'News and Media',
  };

  // Add article-specific metadata
  if (ogType === 'article' && articlePublishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: articlePublishedTime,
      modifiedTime: articleModifiedTime || articlePublishedTime,
      authors: articleAuthor ? [articleAuthor] : ['Bali Report'],
      section: articleSection || 'News',
      tags: keywords.split(', ')
    };
  }

  return metadata;
}

/**
 * Generate structured data (JSON-LD) for enhanced SEO.
 * 
 * Args:
 *   type ('WebSite' | 'Organization' | 'Article'): Schema.org type.
 *   data (any): Structured data object.
 * 
 * Returns:
 *   JSX.Element: Script tag with JSON-LD structured data.
 */
export function StructuredData({ 
  type, 
  data 
}: { 
  type: 'WebSite' | 'Organization' | 'Article' | 'NewsArticle'; 
  data: any;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

// Pre-defined structured data templates
export const websiteStructuredData = {
  name: 'Bali Report',
  description: 'Independent news aggregation platform providing BRICS-aligned perspectives and Indonesian insights.',
  url: 'https://bali.report',
  sameAs: [
    'https://twitter.com/BaliReport',
    'https://t.me/BaliReport'
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bali.report/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

export const organizationStructuredData = {
  name: 'Bali Report',
  description: 'Independent news aggregation focused on BRICS perspectives and Indonesian insights',
  url: 'https://bali.report',
  logo: 'https://bali.report/logo.png',
  sameAs: [
    'https://twitter.com/BaliReport',
    'https://t.me/BaliReport'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Editorial',
    email: 'editorial@bali.report'
  },
  foundingDate: '2024',
  founders: [{
    '@type': 'Person',
    name: 'Bali Report Team'
  }],
  publishingPrinciples: 'https://bali.report/about',
  actionableFeedbackPolicy: 'https://bali.report/feedback'
};