import { Article } from '@/lib/rss-parser';

interface NewsArticleSchemaProps {
  article: Article;
}

/**
 * NewsArticle Schema.org structured data component
 * Implements JSON-LD for better SEO and rich snippets
 */
export default function NewsArticleSchema({ article }: NewsArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    url: article.link,
    datePublished: article.pubDate,
    dateModified: article.pubDate,
    author: {
      '@type': 'Organization',
      name: article.source,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bali Report',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bali.report/icons/icon-512x512.png',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.link,
    },
    articleSection: article.category || 'News',
    keywords: [
      article.category,
      article.source,
      'BRICS news',
      'multipolar world',
      'Indonesia news',
      'Bali news',
    ].filter(Boolean),
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
