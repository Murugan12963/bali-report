/**
 * AdSense configuration and content validation utilities
 */

// Pages where ads should not be shown
export const AD_EXCLUDED_PATHS = [
  '/api',
  '/offline',
  '/404',
  '/500',
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.json',
];

// Content requirements for showing ads
export const CONTENT_REQUIREMENTS = {
  MIN_WORD_COUNT: 250,
  MIN_ARTICLE_COUNT: 3, // For listing pages
  EXCLUDED_SELECTORS: [
    '.ad-container',
    '.adsbygoogle',
    'nav',
    'header',
    'footer',
    '.newsletter-signup',
  ],
};

/**
 * Check if ads should be shown on current page
 */
export function shouldShowAds(pathname: string): boolean {
  // Don't show ads on excluded paths
  if (AD_EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return false;
  }

  // Don't show ads on API routes
  if (pathname.startsWith('/api/')) {
    return false;
  }

  return true;
}

/**
 * Validate page content for AdSense compliance
 */
export function validatePageContent(): {
  isValid: boolean;
  wordCount: number;
  reason?: string;
} {
  try {
    // Get all text content, excluding ads and navigation
    let textContent = '';
    const contentElements = document.querySelectorAll('main, article, .content, .article-content');
    
    if (contentElements.length > 0) {
      // Use main content areas if available
      contentElements.forEach(el => {
        textContent += (el.textContent || '') + ' ';
      });
    } else {
      // Fallback to body content, excluding navigation and ads
      const excludeSelectors = CONTENT_REQUIREMENTS.EXCLUDED_SELECTORS.join(', ');
      const elementsToExclude = document.querySelectorAll(excludeSelectors);
      
      // Clone body and remove excluded elements
      const bodyClone = document.body.cloneNode(true) as HTMLElement;
      const excludedInClone = bodyClone.querySelectorAll(excludeSelectors);
      excludedInClone.forEach(el => el.remove());
      
      textContent = bodyClone.textContent || bodyClone.innerText || '';
    }

    // Clean and count words
    const words = textContent.trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 2); // Filter out very short words
    
    const wordCount = words.length;
    const isValid = wordCount >= CONTENT_REQUIREMENTS.MIN_WORD_COUNT;

    return {
      isValid,
      wordCount,
      reason: isValid ? undefined : `Insufficient content: ${wordCount} words (need ${CONTENT_REQUIREMENTS.MIN_WORD_COUNT}+)`,
    };
  } catch (error) {
    console.error('Error validating page content:', error);
    return {
      isValid: false,
      wordCount: 0,
      reason: 'Content validation error',
    };
  }
}

/**
 * Check if current page is a valid content page for ads
 */
export function isValidAdPage(): boolean {
  if (typeof window === 'undefined') return false;
  
  const pathname = window.location.pathname;
  
  // Check if path is excluded
  if (!shouldShowAds(pathname)) {
    console.log('AdSense: Page excluded by path rules');
    return false;
  }

  // Validate content
  const contentValidation = validatePageContent();
  if (!contentValidation.isValid) {
    console.log('AdSense: Content validation failed -', contentValidation.reason);
    return false;
  }

  console.log('AdSense: Page validated for ads -', contentValidation.wordCount, 'words');
  return true;
}
