/**
 * Content Moderation Service for Bali Report
 * Handles content quality, duplicate detection, and source reliability
 */

import { Article } from './rss-parser';

export interface ModerationResult {
  approved: boolean;
  score: number;
  flags: ModerationFlag[];
  reason?: string;
}

export interface ModerationFlag {
  type: 'duplicate' | 'low_quality' | 'spam' | 'missing_content' | 'unreliable_source' | 'inappropriate';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number; // 0-1
}

export interface SourceReliability {
  source: string;
  reliabilityScore: number; // 0-1
  totalArticles: number;
  qualityIssues: number;
  lastUpdated: string;
  flags: string[];
}

export interface ContentQualityMetrics {
  totalArticlesProcessed: number;
  approvedArticles: number;
  rejectedArticles: number;
  duplicatesRemoved: number;
  qualityIssues: number;
  sourceReliabilityUpdates: number;
}

/**
 * Content Moderation Service
 * Handles automated quality control for RSS articles
 */
export class ContentModerationService {
  private duplicateThreshold = 0.65; // Similarity threshold for duplicates
  private minQualityScore = 0.3; // Minimum quality score to pass
  private sourceReliabilityCache = new Map<string, SourceReliability>();

  /**
   * Moderate a single article for quality and appropriateness.
   * 
   * Args:
   *   article (Article): Article to moderate.
   *   existingArticles (Article[]): Existing articles to check for duplicates.
   * 
   * Returns:
   *   Promise<ModerationResult>: Moderation result with approval status.
   */
  async moderateArticle(
    article: Article, 
    existingArticles: Article[] = []
  ): Promise<ModerationResult> {
    const flags: ModerationFlag[] = [];
    let score = 1.0;

    // 1. Check for duplicate content
    const duplicateCheck = await this.checkDuplicate(article, existingArticles);
    if (duplicateCheck.isDuplicate) {
      flags.push({
        type: 'duplicate',
        severity: 'high',
        description: `Similar to existing article: "${duplicateCheck.similarTitle}"`,
        confidence: duplicateCheck.confidence
      });
      score -= 0.8;
    }

    // 2. Validate content quality
    const qualityCheck = this.validateContentQuality(article);
    if (qualityCheck.issues.length > 0) {
      qualityCheck.issues.forEach(issue => {
        flags.push({
          type: 'low_quality',
          severity: issue.severity,
          description: issue.description,
          confidence: issue.confidence
        });
      });
      score -= qualityCheck.qualityReduction;
    }

    // 3. Check source reliability
    const sourceCheck = await this.assessSourceReliability(article.source);
    if (sourceCheck.reliabilityScore < 0.5) {
      flags.push({
        type: 'unreliable_source',
        severity: 'medium',
        description: `Source "${article.source}" has low reliability score: ${sourceCheck.reliabilityScore}`,
        confidence: 0.8
      });
      score -= 0.3;
    }

    // 4. Basic spam detection
    const spamCheck = this.detectSpam(article);
    if (spamCheck.isSpam) {
      flags.push({
        type: 'spam',
        severity: 'high',
        description: spamCheck.reason,
        confidence: spamCheck.confidence
      });
      score -= 0.6;
    }

    // Final approval decision
    const approved = score >= this.minQualityScore && !flags.some(f => f.severity === 'high');

    return {
      approved,
      score: Math.max(0, Math.min(1, score)),
      flags,
      reason: approved ? undefined : this.generateRejectionReason(flags)
    };
  }

  /**
   * Moderate multiple articles in batch.
   * 
   * Args:
   *   articles (Article[]): Articles to moderate.
   * 
   * Returns:
   *   Promise<{ approved: Article[], rejected: Article[], results: ModerationResult[] }>
   */
  async moderateArticles(articles: Article[]) {
    const results: ModerationResult[] = [];
    const approved: Article[] = [];
    const rejected: Article[] = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const existingArticles = articles.slice(0, i); // Check against previous articles
      
      const result = await this.moderateArticle(article, existingArticles);
      results.push(result);

      if (result.approved) {
        approved.push(article);
      } else {
        rejected.push(article);
        console.warn(`❌ Article rejected: "${article.title}" - ${result.reason}`);
      }
    }

    console.log(`✅ Moderation complete: ${approved.length} approved, ${rejected.length} rejected`);

    return { approved, rejected, results };
  }

  /**
   * Check if article is duplicate of existing articles.
   * 
   * Args:
   *   article (Article): Article to check.
   *   existingArticles (Article[]): Existing articles to compare against.
   * 
   * Returns:
   *   Promise<{ isDuplicate: boolean, confidence: number, similarTitle?: string }>
   */
  private async checkDuplicate(
    article: Article, 
    existingArticles: Article[]
  ): Promise<{ isDuplicate: boolean; confidence: number; similarTitle?: string }> {
    const titleNormalized = this.normalizeText(article.title);
    const descNormalized = this.normalizeText(article.description);

    for (const existing of existingArticles) {
      const existingTitleNorm = this.normalizeText(existing.title);
      const existingDescNorm = this.normalizeText(existing.description);

      // Calculate title similarity
      const titleSimilarity = this.calculateTextSimilarity(titleNormalized, existingTitleNorm);
      
      // Calculate description similarity
      const descSimilarity = this.calculateTextSimilarity(descNormalized, existingDescNorm);

      // Combined similarity score
      const combinedSimilarity = (titleSimilarity * 0.7) + (descSimilarity * 0.3);

      if (combinedSimilarity >= this.duplicateThreshold) {
        return {
          isDuplicate: true,
          confidence: combinedSimilarity,
          similarTitle: existing.title
        };
      }
    }

    return { isDuplicate: false, confidence: 0 };
  }

  /**
   * Validate content quality of an article.
   * 
   * Args:
   *   article (Article): Article to validate.
   * 
   * Returns:
   *   { issues: QualityIssue[], qualityReduction: number }
   */
  private validateContentQuality(article: Article): {
    issues: Array<{ severity: 'low' | 'medium' | 'high', description: string, confidence: number }>,
    qualityReduction: number
  } {
    const issues: Array<{ severity: 'low' | 'medium' | 'high', description: string, confidence: number }> = [];
    let qualityReduction = 0;

    // Check for missing essential content
    if (!article.title || article.title.trim().length < 5) {
      issues.push({
        severity: 'high',
        description: 'Title is missing or too short',
        confidence: 1.0
      });
      qualityReduction += 0.5;
    }

    if (!article.description || article.description.trim().length < 20) {
      issues.push({
        severity: 'medium',
        description: 'Description is missing or too short',
        confidence: 0.9
      });
      qualityReduction += 0.3;
    }

    if (!article.link || !this.isValidUrl(article.link)) {
      issues.push({
        severity: 'high',
        description: 'Invalid or missing URL',
        confidence: 1.0
      });
      qualityReduction += 0.4;
    }

    if (!article.pubDate || isNaN(new Date(article.pubDate).getTime())) {
      issues.push({
        severity: 'low',
        description: 'Invalid or missing publication date',
        confidence: 0.8
      });
      qualityReduction += 0.1;
    }

    // Check for content quality indicators
    const titleWords = article.title.split(' ').length;
    if (titleWords > 20) {
      issues.push({
        severity: 'low',
        description: 'Title is unusually long (may be clickbait)',
        confidence: 0.6
      });
      qualityReduction += 0.1;
    }

    if (titleWords < 3) {
      issues.push({
        severity: 'medium',
        description: 'Title is too short',
        confidence: 0.8
      });
      qualityReduction += 0.2;
    }

    // Check for excessive capitalization (SPAM indicator)
    const capsRatio = (article.title.match(/[A-Z]/g) || []).length / article.title.length;
    if (capsRatio > 0.5) {
      issues.push({
        severity: 'medium',
        description: 'Excessive capitalization in title',
        confidence: 0.7
      });
      qualityReduction += 0.2;
    }

    return { issues, qualityReduction };
  }

  /**
   * Assess reliability of a news source.
   * 
   * Args:
   *   source (string): Source name to assess.
   * 
   * Returns:
   *   Promise<SourceReliability>: Source reliability assessment.
   */
  private async assessSourceReliability(source: string): Promise<SourceReliability> {
    // Check cache first
    if (this.sourceReliabilityCache.has(source)) {
      const cached = this.sourceReliabilityCache.get(source)!;
      const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
      
      // Use cache if less than 24 hours old
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return cached;
      }
    }

    // Default reliability scores for known sources
    const knownSources: Record<string, number> = {
      'RT News': 0.8,
      'TASS': 0.8,
      'Xinhua News': 0.8,
      'BBC Asia': 0.9,
      'Al Jazeera': 0.9,
      'NDTV News': 0.8,
      'Press TV': 0.7,
      'Global Times': 0.7,
      'Antara News': 0.8,
      'Indonesia Business Post': 0.7,
      'Kompas News': 0.8,
      'Tempo News': 0.8,
    };

    const reliabilityScore = knownSources[source] || 0.4; // Default for unknown sources
    
    const reliability: SourceReliability = {
      source,
      reliabilityScore,
      totalArticles: 0, // Would be populated from database in real implementation
      qualityIssues: 0,
      lastUpdated: new Date().toISOString(),
      flags: reliabilityScore < 0.7 ? ['needs_review'] : []
    };

    // Cache the result
    this.sourceReliabilityCache.set(source, reliability);

    return reliability;
  }

  /**
   * Detect spam or promotional content.
   * 
   * Args:
   *   article (Article): Article to check for spam.
   * 
   * Returns:
   *   { isSpam: boolean, reason: string, confidence: number }
   */
  private detectSpam(article: Article): { isSpam: boolean; reason: string; confidence: number } {
    const spamKeywords = [
      'buy now', 'limited time', 'act fast', 'special offer', 'click here',
      'guaranteed', 'free money', 'make money fast', 'work from home',
      'viagra', 'casino', 'lottery', 'winner', 'congratulations'
    ];

    const promoIndicators = [
      'subscribe', 'follow us', 'like us', 'share this', 'download now'
    ];

    const combinedText = `${article.title} ${article.description}`.toLowerCase();

    // Check for spam keywords
    const spamMatches = spamKeywords.filter(keyword => combinedText.includes(keyword));
    if (spamMatches.length >= 2) {
      return {
        isSpam: true,
        reason: `Contains spam keywords: ${spamMatches.join(', ')}`,
        confidence: 0.9
      };
    }

    // Check for promotional content
    const promoMatches = promoIndicators.filter(indicator => combinedText.includes(indicator));
    if (promoMatches.length >= 3) {
      return {
        isSpam: true,
        reason: `Contains excessive promotional language: ${promoMatches.join(', ')}`,
        confidence: 0.7
      };
    }

    // Check for excessive punctuation (!!!, ???)
    const exclamationCount = (combinedText.match(/!/g) || []).length;
    const questionCount = (combinedText.match(/\?/g) || []).length;
    
    if (exclamationCount > 5 || questionCount > 3) {
      return {
        isSpam: true,
        reason: 'Excessive punctuation indicating promotional content',
        confidence: 0.6
      };
    }

    return { isSpam: false, reason: '', confidence: 0 };
  }

  /**
   * Normalize text for comparison by removing punctuation, extra spaces, etc.
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Calculate similarity between two text strings using Jaccard similarity.
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(text2.split(' ').filter(w => w.length > 2));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Validate URL format.
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  /**
   * Generate human-readable rejection reason from flags.
   */
  private generateRejectionReason(flags: ModerationFlag[]): string {
    const highPriorityFlags = flags.filter(f => f.severity === 'high');
    if (highPriorityFlags.length > 0) {
      return highPriorityFlags.map(f => f.description).join('; ');
    }

    const mediumPriorityFlags = flags.filter(f => f.severity === 'medium');
    if (mediumPriorityFlags.length > 0) {
      return mediumPriorityFlags.map(f => f.description).join('; ');
    }

    return flags.map(f => f.description).join('; ');
  }

  /**
   * Get content quality metrics for analytics.
   */
  getQualityMetrics(): ContentQualityMetrics {
    // In real implementation, this would query from database
    return {
      totalArticlesProcessed: 0,
      approvedArticles: 0,
      rejectedArticles: 0,
      duplicatesRemoved: 0,
      qualityIssues: 0,
      sourceReliabilityUpdates: 0
    };
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();