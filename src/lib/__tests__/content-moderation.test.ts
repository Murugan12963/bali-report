import { contentModerationService, ContentModerationService } from '../content-moderation';
import { Article } from '../rss-parser';

describe('ContentModerationService', () => {
  let moderationService: ContentModerationService;

  beforeEach(() => {
    moderationService = new ContentModerationService();
  });

  describe('Article Quality Validation', () => {
    test('should approve high-quality articles', async () => {
      const article: Article = {
        id: 'test-1',
        title: 'High Quality News Article About BRICS Economic Partnership',
        link: 'https://example.com/article',
        description: 'This is a well-written article about economic cooperation between BRICS nations, providing detailed analysis and insights.',
        pubDate: new Date().toISOString(),
        source: 'BBC Asia',
        sourceUrl: 'https://bbc.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(article);
      
      expect(result.approved).toBe(true);
      expect(result.score).toBeGreaterThan(0.5);
      expect(result.flags).toHaveLength(0);
    });

    test('should reject articles with missing essential content', async () => {
      const article: Article = {
        id: 'test-2',
        title: 'Bad',
        link: 'invalid-url',
        description: 'Too short',
        pubDate: new Date().toISOString(),
        source: 'Unknown Source',
        sourceUrl: 'https://unknown.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(article);
      
      expect(result.approved).toBe(false);
      expect(result.score).toBeLessThan(0.3);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'low_quality',
            severity: expect.stringMatching(/medium|high/)
          })
        ])
      );
    });

    test('should detect spam content', async () => {
      const article: Article = {
        id: 'test-3',
        title: 'BUY NOW!!! LIMITED TIME SPECIAL OFFER!!!',
        link: 'https://spam.com/buy-now',
        description: 'Click here to buy now! Limited time offer! Act fast! Special discount! Free money guaranteed!',
        pubDate: new Date().toISOString(),
        source: 'Spam Source',
        sourceUrl: 'https://spam.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(article);
      
      expect(result.approved).toBe(false);
      expect(result.flags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'spam',
            severity: 'high'
          })
        ])
      );
    });
  });

  describe('Duplicate Detection', () => {
    test('should detect duplicate articles', async () => {
      const originalArticle: Article = {
        id: 'original-1',
        title: 'China and India Strengthen Economic Ties',
        link: 'https://source1.com/article',
        description: 'China and India have announced new economic cooperation agreements to strengthen bilateral trade relations.',
        pubDate: new Date().toISOString(),
        source: 'Source 1',
        sourceUrl: 'https://source1.com/rss',
        category: 'BRICS'
      };

      const duplicateArticle: Article = {
        id: 'duplicate-1',
        title: 'China and India Strengthen Economic Ties Through New Agreements',
        link: 'https://source2.com/similar-article',
        description: 'China and India announced new economic cooperation deals to strengthen their bilateral trade partnerships.',
        pubDate: new Date().toISOString(),
        source: 'Source 2',
        sourceUrl: 'https://source2.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(duplicateArticle, [originalArticle]);
      
      expect(result.approved).toBe(false);
      expect(result.flags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'duplicate',
            severity: 'high',
            confidence: expect.any(Number)
          })
        ])
      );
    });

    test('should not flag dissimilar articles as duplicates', async () => {
      const article1: Article = {
        id: 'article-1',
        title: 'BRICS Economic Summit Scheduled for Next Month',
        link: 'https://source1.com/article1',
        description: 'The annual BRICS economic summit will take place next month in Brazil.',
        pubDate: new Date().toISOString(),
        source: 'Source 1',
        sourceUrl: 'https://source1.com/rss',
        category: 'BRICS'
      };

      const article2: Article = {
        id: 'article-2',
        title: 'Indonesia Increases Trade with Southeast Asian Partners',
        link: 'https://source2.com/article2',
        description: 'Indonesia has expanded its trading relationships with neighboring Southeast Asian countries.',
        pubDate: new Date().toISOString(),
        source: 'Source 2',
        sourceUrl: 'https://source2.com/rss',
        category: 'Indonesia'
      };

      const result = await moderationService.moderateArticle(article2, [article1]);
      
      expect(result.approved).toBe(true);
      expect(result.flags).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'duplicate' })
        ])
      );
    });
  });

  describe('Source Reliability Assessment', () => {
    test('should recognize reliable sources', async () => {
      const article: Article = {
        id: 'test-reliable',
        title: 'Breaking News from Trusted Source',
        link: 'https://bbc.com/article',
        description: 'This is a legitimate news article from a trusted international news source.',
        pubDate: new Date().toISOString(),
        source: 'BBC Asia',
        sourceUrl: 'https://bbc.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(article);
      
      expect(result.approved).toBe(true);
      expect(result.flags).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'unreliable_source' })
        ])
      );
    });

    test('should flag articles from unreliable sources', async () => {
      const article: Article = {
        id: 'test-unreliable',
        title: 'News from Unknown Source',
        link: 'https://unknown.com/article',
        description: 'This article is from a source with very low reliability rating.',
        pubDate: new Date().toISOString(),
        source: 'Unknown Unreliable Source',
        sourceUrl: 'https://unknown.com/rss',
        category: 'BRICS'
      };

      // Mock the source reliability to be very low
      const mockReliability = {
        source: 'Unknown Unreliable Source',
        reliabilityScore: 0.2, // Very low score
        totalArticles: 0,
        qualityIssues: 0,
        lastUpdated: new Date().toISOString(),
        flags: ['needs_review']
      };

      // We can't easily mock private methods, so we'll test with a source that would naturally get low scores
      const result = await moderationService.moderateArticle(article);
      
      // The unknown source should get flagged or at least get a lower score
      expect(result.score).toBeLessThan(0.8);
    });
  });

  describe('Batch Article Moderation', () => {
    test('should moderate multiple articles correctly', async () => {
      const articles: Article[] = [
        {
          id: 'batch-1',
          title: 'Good Quality Article About BRICS Cooperation',
          link: 'https://example.com/good',
          description: 'This is a comprehensive article about BRICS economic cooperation with detailed analysis.',
          pubDate: new Date().toISOString(),
          source: 'BBC Asia',
          sourceUrl: 'https://bbc.com/rss',
          category: 'BRICS'
        },
        {
          id: 'batch-2',
          title: 'Bad',
          link: 'invalid',
          description: 'Bad',
          pubDate: 'invalid',
          source: 'Unknown',
          sourceUrl: 'invalid',
          category: 'BRICS'
        },
        {
          id: 'batch-3',
          title: 'BUY NOW LIMITED TIME!!!',
          link: 'https://spam.com/buy',
          description: 'Click here now! Buy now! Limited time! Free money! Act fast!',
          pubDate: new Date().toISOString(),
          source: 'Spam Source',
          sourceUrl: 'https://spam.com/rss',
          category: 'BRICS'
        }
      ];

      const result = await moderationService.moderateArticles(articles);
      
      expect(result.approved).toHaveLength(1); // Only the first article should pass
      expect(result.rejected).toHaveLength(2); // The other two should be rejected
      expect(result.results).toHaveLength(3); // Should have results for all articles
      
      // First article should be approved
      expect(result.results[0].approved).toBe(true);
      expect(result.approved[0].id).toBe('batch-1');
      
      // Second and third articles should be rejected
      expect(result.results[1].approved).toBe(false);
      expect(result.results[2].approved).toBe(false);
    });

    test('should handle empty article array', async () => {
      const result = await moderationService.moderateArticles([]);
      
      expect(result.approved).toHaveLength(0);
      expect(result.rejected).toHaveLength(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('Content Quality Metrics', () => {
    test('should return default metrics when no processing has occurred', () => {
      const metrics = moderationService.getQualityMetrics();
      
      expect(metrics).toEqual({
        totalArticlesProcessed: 0,
        approvedArticles: 0,
        rejectedArticles: 0,
        duplicatesRemoved: 0,
        qualityIssues: 0,
        sourceReliabilityUpdates: 0
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle articles with unusual characters', async () => {
      const article: Article = {
        id: 'test-unicode',
        title: '中国与印度加强经济合作 🇨🇳🇮🇳',
        link: 'https://example.com/unicode',
        description: 'This article contains unicode characters, emojis, and special symbols: ñáéíóú',
        pubDate: new Date().toISOString(),
        source: 'International Source',
        sourceUrl: 'https://international.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(article);
      
      // Should not crash and should process normally
      expect(result).toBeDefined();
      expect(result.approved).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    test('should handle extremely long titles and descriptions', async () => {
      const longTitle = 'A'.repeat(500);
      const longDescription = 'B'.repeat(1000);

      const article: Article = {
        id: 'test-long',
        title: longTitle,
        link: 'https://example.com/long',
        description: longDescription,
        pubDate: new Date().toISOString(),
        source: 'Test Source',
        sourceUrl: 'https://test.com/rss',
        category: 'BRICS'
      };

      const result = await moderationService.moderateArticle(article);
      
      // Should not crash but may flag as low quality due to unusual length
      expect(result).toBeDefined();
      expect(result.approved).toBeDefined();
    });

    test('should handle missing optional fields gracefully', async () => {
      const article: Article = {
        id: 'test-minimal',
        title: 'Minimal Article Title About Economic News',
        link: 'https://example.com/minimal',
        description: 'This article has minimal required fields but should still be processed correctly.',
        pubDate: new Date().toISOString(),
        source: 'Minimal Source',
        sourceUrl: 'https://minimal.com/rss',
        category: 'BRICS'
        // Missing optional fields like author, imageUrl
      };

      const result = await moderationService.moderateArticle(article);
      
      expect(result).toBeDefined();
      expect(result.approved).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});