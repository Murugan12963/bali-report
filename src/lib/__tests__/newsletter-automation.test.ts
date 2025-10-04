import { NewsletterAutomation, DEFAULT_SCHEDULES } from '../newsletter-automation';
import { NewsletterTemplates } from '@/emails/newsletter-templates';
import { customizeContentForSegment } from '../newsletter-segmentation';

// Mock external dependencies
jest.mock('../rss-parser', () => ({
  rssAggregator: {
    fetchAllSources: jest.fn()
  }
}));
jest.mock('../mailchimp');
jest.mock('@mailchimp/mailchimp_marketing');

describe('NewsletterAutomation', () => {
  let automation: NewsletterAutomation;
  
  beforeEach(() => {
    // Reset environment variables for testing
    process.env.MAILCHIMP_API_KEY = 'test-api-key';
    process.env.MAILCHIMP_SERVER_PREFIX = 'us1';
    process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience';
    
    automation = new NewsletterAutomation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNewsletterContent', () => {
    const mockSchedule = DEFAULT_SCHEDULES[0]; // daily-morning schedule

    it('should generate newsletter content with correct structure', async () => {
      // Mock RSS articles
      const mockArticles = [
        {
          title: 'BRICS Summit Highlights Multipolar World',
          description: 'Leaders discuss economic cooperation and global governance reforms',
          url: 'https://example.com/brics-summit',
          source: 'RT News',
          category: 'BRICS',
          publishedAt: new Date().toISOString()
        },
        {
          title: 'Indonesia Boosts Infrastructure Investment',
          description: 'New projects announced in transportation and digital connectivity',
          url: 'https://example.com/indonesia-infrastructure',
          source: 'Antara News',
          category: 'Indonesia',
          publishedAt: new Date().toISOString()
        }
      ];

      // Mock rssAggregator.fetchAllSources
      const { rssAggregator } = require('../rss-parser');
      rssAggregator.fetchAllSources.mockResolvedValue(mockArticles);

      const content = await automation.generateNewsletterContent(mockSchedule);

      expect(content).toBeDefined();
      expect(content.id).toMatch(/newsletter_\d+/);
      expect(content.title).toContain('Daily Brief');
      expect(content.subject).toContain('Daily Brief');
      expect(content.preheader).toBeDefined();
      expect(content.sections).toBeDefined();
      expect(content.scheduleId).toBe(mockSchedule.id);
      expect(content.generatedAt).toBeDefined();
    });

    it('should handle empty article list gracefully', async () => {
      // Mock empty RSS feed
      const { rssAggregator } = require('../rss-parser');
      rssAggregator.fetchAllSources.mockResolvedValue([]);

      const content = await automation.generateNewsletterContent(mockSchedule);

      expect(content.sections).toHaveLength(3); // Header, no articles message, and footer
      expect(content.sections.some(section => 
        section.content?.includes('working on bringing you fresh content')
      )).toBe(true);
    });
  });

  describe('curateArticles', () => {
    const mockArticles = [
      {
        title: 'China Russia Trade Partnership',
        description: 'Economic cooperation between BRICS members grows',
        source: 'TASS',
        category: 'BRICS',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Bali Tourism Recovery Update',
        description: 'Island sees increased visitor numbers',
        source: 'Jakarta Post',
        category: 'Bali',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Global Climate Conference',
        description: 'Nations discuss environmental policies',
        source: 'BBC Asia',
        category: 'Environment',
        publishedAt: new Date().toISOString()
      }
    ];

    it('should calculate relevance scores correctly', async () => {
      // Access private method through type assertion for testing
      const curateArticles = (automation as any).curateArticles.bind(automation);
      const calculateRelevanceScore = (automation as any).calculateRelevanceScore.bind(automation);

      // Mock rssAggregator to return test articles
      const { rssAggregator } = require('../rss-parser');
      rssAggregator.fetchAllSources.mockResolvedValue(mockArticles);

      const filters = {
        categories: ['brics', 'bali'],
        maxArticles: 10,
        minRelevanceScore: 20
      };

      const curatedArticles = await curateArticles(filters);
      
      expect(curatedArticles).toBeDefined();
      expect(Array.isArray(curatedArticles)).toBe(true);

      // Test relevance scoring for BRICS content
      const bricsScore = calculateRelevanceScore(mockArticles[0], filters);
      expect(bricsScore).toBeGreaterThan(40); // Base + BRICS keywords + trusted source

      // Test relevance scoring for Bali content  
      const baliScore = calculateRelevanceScore(mockArticles[1], filters);
      expect(baliScore).toBeGreaterThanOrEqual(40); // Base + Bali keywords

      // Test relevance scoring for other content
      const otherScore = calculateRelevanceScore(mockArticles[2], filters);
      expect(otherScore).toBeGreaterThan(0);
    });

    it('should filter articles by categories correctly', async () => {
      const curateArticles = (automation as any).curateArticles.bind(automation);
      
      const { rssAggregator } = require('../rss-parser');
      rssAggregator.fetchAllSources.mockResolvedValue(mockArticles);

      const filters = {
        categories: ['bali'],
        maxArticles: 10,
        minRelevanceScore: 0
      };

      const curatedArticles = await curateArticles(filters);
      
      // Should only include articles with 'bali' in title/description or category
      const baliArticles = curatedArticles.filter(article => 
        article.title.toLowerCase().includes('bali') ||
        article.description.toLowerCase().includes('bali')
      );
      
      expect(baliArticles.length).toBeGreaterThan(0);
    });

    it('should limit article count based on maxArticles', async () => {
      const curateArticles = (automation as any).curateArticles.bind(automation);
      
      const { rssAggregator } = require('../rss-parser');
      rssAggregator.fetchAllSources.mockResolvedValue(mockArticles);

      const filters = {
        maxArticles: 2,
        minRelevanceScore: 0
      };

      const curatedArticles = await curateArticles(filters);
      expect(curatedArticles.length).toBeLessThanOrEqual(2);
    });
  });

  describe('generateSubjectLine', () => {
    it('should generate appropriate subject lines for different newsletter types', () => {
      const generateSubjectLine = (automation as any).generateSubjectLine.bind(automation);
      
      const mockArticles = [
        {
          title: 'Breaking: Major Economic Summit Announced',
          description: 'Leaders to discuss trade agreements'
        }
      ];

      // Test daily subject line
      const dailySubject = generateSubjectLine(mockArticles, 'daily');
      expect(dailySubject).toMatch(/Daily Brief:|Today's Top Story:|Bali Report Daily:/);
      expect(dailySubject).toContain('🌺');

      // Test weekly subject line
      const weeklySubject = generateSubjectLine(mockArticles, 'weekly');
      expect(weeklySubject).toMatch(/Week's Highlights:|Weekly Roundup:|This Week:/);

      // Test monthly subject line
      const monthlySubject = generateSubjectLine(mockArticles, 'monthly');
      expect(monthlySubject).toMatch(/Monthly Digest:|Month in Review:|Monthly Summary:/);
    });

    it('should handle empty articles list', () => {
      const generateSubjectLine = (automation as any).generateSubjectLine.bind(automation);
      
      const emptySubject = generateSubjectLine([], 'daily');
      expect(emptySubject).toBe('Bali Report Daily Update');
    });

    it('should truncate long article titles in subject line', () => {
      const generateSubjectLine = (automation as any).generateSubjectLine.bind(automation);
      
      const longTitleArticles = [
        {
          title: 'This is an extremely long article title that exceeds the reasonable character limit for email subject lines and should be truncated',
          description: 'Article description'
        }
      ];

      const subject = generateSubjectLine(longTitleArticles, 'daily');
      expect(subject.length).toBeLessThan(100); // Reasonable email subject length
      expect(subject).toContain('...');
    });
  });

  describe('generatePreheader', () => {
    it('should generate meaningful preheader text', () => {
      const generatePreheader = (automation as any).generatePreheader.bind(automation);
      
      const mockArticles = [
        {
          title: 'BRICS Economic Summit',
          description: 'Economic cooperation discussion'
        },
        {
          title: 'Indonesia Infrastructure',
          description: 'New development projects announced'
        },
        {
          title: 'Bali Tourism Update',
          description: 'Visitor numbers increasing'
        }
      ];

      const preheader = generatePreheader(mockArticles);
      
      expect(preheader).toBeDefined();
      expect(preheader).toContain('•'); // Should contain separator
      expect(preheader.toLowerCase()).toMatch(/brics|indonesia|bali/); // Should mention content
    });

    it('should provide fallback for empty articles', () => {
      const generatePreheader = (automation as any).generatePreheader.bind(automation);
      
      const preheader = generatePreheader([]);
      expect(preheader).toBe('Stay updated with the latest multi-polar news and insights.');
    });
  });

  describe('buildNewsletterSections', () => {
    it('should create proper newsletter sections from articles', async () => {
      const buildNewsletterSections = (automation as any).buildNewsletterSections.bind(automation);
      const mockSchedule = DEFAULT_SCHEDULES[0];
      
      const mockArticles = [
        {
          title: 'BRICS Summit Highlights',
          description: 'Major economic agreements reached',
          url: 'https://example.com/1',
          source: 'RT News',
          publishedAt: new Date().toISOString(),
          relevanceScore: 85
        },
        {
          title: 'Indonesia Trade Growth',
          description: 'Export numbers show positive trend',
          url: 'https://example.com/2',
          source: 'Antara News',
          publishedAt: new Date().toISOString(),
          relevanceScore: 75
        },
        {
          title: 'Bali Cultural Festival',
          description: 'Traditional celebrations draw crowds',
          url: 'https://example.com/3',
          source: 'Jakarta Post',
          publishedAt: new Date().toISOString(),
          relevanceScore: 65
        }
      ];

      const sections = await buildNewsletterSections(mockArticles, mockSchedule);
      
      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);
      
      // Should have header section
      const headerSection = sections.find(s => s.type === 'header');
      expect(headerSection).toBeDefined();
      
      // Should have featured article (highest scoring)
      const featuredSection = sections.find(s => s.type === 'featured');
      expect(featuredSection).toBeDefined();
      expect(featuredSection?.articles?.[0].title).toBe('BRICS Summit Highlights');
      
      // Should have category sections
      const categorySection = sections.find(s => s.type === 'category');
      expect(categorySection).toBeDefined();
      
      // Should have footer section
      const footerSection = sections.find(s => s.type === 'footer');
      expect(footerSection).toBeDefined();
    });
  });

  describe('categorizeArticles', () => {
    it('should properly categorize articles by content', () => {
      const categorizeArticles = (automation as any).categorizeArticles.bind(automation);
      
      const mockArticles = [
        {
          title: 'China Russia Trade Partnership',
          description: 'BRICS economic cooperation grows'
        },
        {
          title: 'Jakarta Infrastructure Development',
          description: 'Indonesia announces new projects'
        },
        {
          title: 'Bali Temple Festival',
          description: 'Traditional ceremony in Denpasar'
        },
        {
          title: 'Global Climate Summit',
          description: 'International environmental meeting'
        }
      ];

      const categories = categorizeArticles(mockArticles);
      
      expect(categories).toBeDefined();
      expect(categories.brics).toBeDefined();
      expect(categories.indonesia).toBeDefined();
      expect(categories.bali).toBeDefined();
      expect(categories.other).toBeDefined();
      
      expect(categories.brics.length).toBe(1);
      expect(categories.indonesia.length).toBe(1);
      expect(categories.bali.length).toBe(1);
      expect(categories.other.length).toBe(1);
    });
  });
});

describe('NewsletterTemplates', () => {
  describe('generateHTML', () => {
    it('should generate valid HTML email structure', () => {
      const mockContent = {
        id: 'test-newsletter',
        title: 'Test Daily Brief',
        subject: 'Test Subject',
        preheader: 'Test preheader',
        sections: [
          {
            type: 'header' as const,
            title: 'Daily Brief',
            content: 'Good morning! Here is your daily news.'
          },
          {
            type: 'featured' as const,
            title: 'Featured Story',
            articles: [{
              title: 'Test Article',
              description: 'Test description',
              url: 'https://example.com',
              source: 'Test Source',
              category: 'Test',
              publishedAt: new Date().toISOString()
            }]
          },
          {
            type: 'footer' as const,
            content: 'Thank you for reading!'
          }
        ],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test-schedule'
      };

      const html = NewsletterTemplates.generateHTML(mockContent);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en"');
      expect(html).toContain('<head>');
      expect(html).toContain('<body class="body"');
      expect(html).toContain('Test Daily Brief');
      expect(html).toContain('Test Article');
      expect(html).toContain('email-container');
      expect(html).toContain('*|IMGTRACKING|*'); // Mailchimp tracking
    });

    it('should include responsive CSS for mobile compatibility', () => {
      const mockContent = {
        id: 'test',
        title: 'Test',
        subject: 'Test',
        preheader: 'Test',
        sections: [],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test'
      };

      const html = NewsletterTemplates.generateHTML(mockContent);
      
      expect(html).toContain('@media only screen and (max-width: 600px)');
      expect(html).toContain('max-width: 600px');
      expect(html).toContain('border-radius:');
    });

    it('should include proper email client compatibility tags', () => {
      const mockContent = {
        id: 'test',
        title: 'Test',
        subject: 'Test',
        preheader: 'Test',
        sections: [],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test'
      };

      const html = NewsletterTemplates.generateHTML(mockContent);
      
      expect(html).toContain('xmlns:v="urn:schemas-microsoft-com:vml"');
      expect(html).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
      expect(html).toContain('<!--[if mso]>');
      expect(html).toContain('<![endif]-->');
      expect(html).toContain('meta name="x-apple-disable-message-reformatting"');
    });
  });

  describe('generatePlainText', () => {
    it('should create readable plain text version', () => {
      const mockContent = {
        id: 'test',
        title: 'Daily Brief - Monday, January 1, 2024',
        subject: 'Test Subject',
        preheader: 'Test preheader',
        sections: [
          {
            type: 'featured' as const,
            title: 'Featured Story',
            articles: [{
              title: 'Test Article Title',
              description: 'This is a test article description that should appear in plain text.',
              url: 'https://example.com/article',
              source: 'Test Source',
              category: 'Test',
              publishedAt: new Date().toISOString()
            }]
          }
        ],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test'
      };

      const plainText = NewsletterTemplates.generatePlainText(mockContent);
      
      expect(plainText).toContain('BALI REPORT');
      expect(plainText).toContain('DAILY BRIEF');
      expect(plainText).toContain('Test Article Title');
      expect(plainText).toContain('This is a test article description');
      expect(plainText).toContain('https://example.com/article');
      expect(plainText).toContain('Test Source');
      expect(plainText).toContain('https://bali.report');
      expect(plainText).not.toContain('<'); // No HTML tags
      expect(plainText).not.toContain('>');
    });
  });

  describe('generatePreviewText', () => {
    it('should generate concise preview text for email clients', () => {
      const mockContent = {
        id: 'test',
        title: 'Test Newsletter',
        subject: 'Test Subject',
        preheader: 'Custom preheader text for testing',
        sections: [],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test'
      };

      const preview = NewsletterTemplates.generatePreviewText(mockContent);
      expect(preview).toBe('Custom preheader text for testing');
    });

    it('should generate preview from featured article when no preheader', () => {
      const mockContent = {
        id: 'test',
        title: 'Test Newsletter',
        subject: 'Test Subject',
        preheader: '',
        sections: [
          {
            type: 'featured' as const,
            title: 'Featured',
            articles: [{
              title: 'Featured Article Title',
              description: 'This is the featured article description that should be used for preview.',
              url: 'https://example.com',
              source: 'Test Source',
              category: 'Test',
              publishedAt: new Date().toISOString()
            }]
          }
        ],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test'
      };

      const preview = NewsletterTemplates.generatePreviewText(mockContent);
      expect(preview).toContain('Featured Article Title');
      expect(preview).toContain('This is the featured article description');
    });

    it('should respect maximum length limit', () => {
      const longContent = {
        id: 'test',
        title: 'Test',
        subject: 'Test',
        preheader: 'This is an extremely long preheader text that should be truncated when it exceeds the maximum character limit for email preview text to ensure proper display across all email clients and platforms including mobile devices.',
        sections: [],
        generatedAt: new Date().toISOString(),
        scheduleId: 'test'
      };

      const preview = NewsletterTemplates.generatePreviewText(longContent, 100);
      expect(preview.length).toBeLessThanOrEqual(103); // Allow for '...' addition
      expect(preview).toContain('...');
    });
  });
});

describe('Newsletter Segmentation', () => {
  describe('customizeContentForSegment', () => {
    const mockArticles = [
      {
        title: 'BRICS Summit Economic Cooperation',
        description: 'Leaders discuss trade and multipolar world order',
        source: 'RT News'
      },
      {
        title: 'Indonesia Tourism Recovery',
        description: 'Travel industry shows strong growth in Jakarta',
        source: 'Antara News'
      },
      {
        title: 'Bali Cultural Festival',
        description: 'Traditional ceremonies celebrate heritage in Denpasar',
        source: 'Jakarta Post'
      },
      {
        title: 'Global Climate Change Conference',
        description: 'International meeting on environmental policies',
        source: 'BBC Asia'
      }
    ];

    it('should filter content for BRICS enthusiasts segment', () => {
      const customized = customizeContentForSegment(mockArticles, 'brics-enthusiasts');
      
      expect(customized.length).toBeGreaterThan(0);
      expect(customized.some(article => 
        article.title.toLowerCase().includes('brics') ||
        article.description.toLowerCase().includes('multipolar')
      )).toBe(true);
    });

    it('should filter content for Indonesia locals segment', () => {
      const customized = customizeContentForSegment(mockArticles, 'indonesia-locals');
      
      expect(customized.length).toBeGreaterThan(0);
      expect(customized.some(article => 
        article.title.toLowerCase().includes('indonesia') ||
        article.description.toLowerCase().includes('jakarta') ||
        article.title.toLowerCase().includes('bali')
      )).toBe(true);
    });

    it('should filter content for Bali tourists segment', () => {
      const customized = customizeContentForSegment(mockArticles, 'bali-tourists');
      
      expect(customized.length).toBeGreaterThan(0);
      expect(customized.some(article => 
        article.title.toLowerCase().includes('bali') ||
        article.description.toLowerCase().includes('cultural') ||
        article.title.toLowerCase().includes('tourism')
      )).toBe(true);
    });

    it('should adjust article count based on engagement level', () => {
      // High engagement segment should get more articles
      const highEngagement = customizeContentForSegment(mockArticles, 'high-engagement');
      
      // Low engagement would get fewer articles, but we need to test with more articles
      const manyArticles = Array(20).fill(mockArticles[0]).map((article, i) => ({
        ...article,
        title: `${article.title} ${i + 1}`
      }));
      
      const lowEngagement = customizeContentForSegment(manyArticles, 'weekly-summary'); // low engagement segment
      
      expect(lowEngagement.length).toBeLessThanOrEqual(8);
    });

    it('should return fallback content when no matches found', () => {
      const nonMatchingArticles = [
        {
          title: 'Random Tech News',
          description: 'Technology update from Silicon Valley',
          source: 'Tech News'
        }
      ];
      
      const customized = customizeContentForSegment(nonMatchingArticles, 'brics-enthusiasts');
      expect(customized.length).toBeGreaterThan(0); // Should return fallback content
    });

    it('should handle unknown segment gracefully', () => {
      const customized = customizeContentForSegment(mockArticles, 'unknown-segment');
      expect(customized).toEqual(mockArticles); // Should return original articles
    });
  });
});