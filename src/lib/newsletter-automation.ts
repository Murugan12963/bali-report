import { rssAggregator } from "./rss-parser";
import { getAudienceStats } from "./mailchimp";
import { NewsletterTemplates } from "@/emails/newsletter-templates";
import mailchimp from "@mailchimp/mailchimp_marketing";

export interface NewsletterSchedule {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'triggered';
  frequency?: 'morning' | 'evening' | 'monday' | 'friday';
  time?: string; // HH:MM format
  segmentIds?: string[];
  templateId: string;
  isActive: boolean;
  lastSent?: string;
  nextSend?: string;
  contentFilters: {
    categories?: string[];
    sources?: string[];
    keywords?: string[];
    minRelevanceScore?: number;
    maxArticles?: number;
  };
}

export interface NewsletterContent {
  id: string;
  title: string;
  subject: string;
  preheader: string;
  sections: NewsletterSection[];
  generatedAt: string;
  scheduleId: string;
}

export interface NewsletterSection {
  type: 'header' | 'featured' | 'category' | 'trending' | 'footer';
  title?: string;
  articles?: Array<{
    title: string;
    description: string;
    url: string;
    source: string;
    category: string;
    pubDate: string;
    imageUrl?: string;
    relevanceScore?: number;
  }>;
  content?: string;
  imageUrl?: string;
}

export interface CampaignStats {
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  openRate: number;
  clickRate: number;
  sentCount: number;
}

/**
 * Newsletter automation service for Bali Report.
 * Handles content curation, scheduling, and campaign management.
 */
export class NewsletterAutomation {
  private listId: string;

  constructor() {
    this.listId = process.env.MAILCHIMP_AUDIENCE_ID || '';
    
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX) {
      mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });
    }
  }

  /**
   * Generate automated newsletter content based on latest articles.
   * 
   * Args:
   *   schedule (NewsletterSchedule): Newsletter schedule configuration.
   *   
   * Returns:
   *   Promise<NewsletterContent>: Generated newsletter content.
   */
  async generateNewsletterContent(schedule: NewsletterSchedule): Promise<NewsletterContent> {
    console.log(`🤖 Generating newsletter content for: ${schedule.name}`);
    
    // Fetch latest articles based on schedule filters
    const articles = await this.curateArticles(schedule.contentFilters);
    
    // Generate content sections
    const sections = await this.buildNewsletterSections(articles, schedule);
    
    // Create newsletter metadata
    const content: NewsletterContent = {
      id: `newsletter_${Date.now()}`,
      title: this.generateNewsletterTitle(schedule.type),
      subject: this.generateSubjectLine(articles, schedule.type),
      preheader: this.generatePreheader(articles),
      sections,
      generatedAt: new Date().toISOString(),
      scheduleId: schedule.id
    };

    console.log(`✅ Generated newsletter with ${articles.length} articles`);
    return content;
  }

  /**
   * Curate articles based on filters and relevance scoring.
   * 
   * Args:
   *   filters (object): Content filtering criteria.
   *   
   * Returns:
   *   Promise<Array>: Curated articles with relevance scores.
   */
  private async curateArticles(filters: NewsletterSchedule['contentFilters']) {
    // Get latest RSS articles
    const allArticles = await rssAggregator.fetchAllSources();
    
    // Filter articles based on criteria
    let filteredArticles = allArticles;
    
    // Filter by categories
    if (filters.categories?.length) {
      filteredArticles = filteredArticles.filter(article => 
        filters.categories!.some(cat => 
          article.category?.toLowerCase().includes(cat.toLowerCase()) ||
          article.title.toLowerCase().includes(cat.toLowerCase()) ||
          article.description.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }
    
    // Filter by sources
    if (filters.sources?.length) {
      filteredArticles = filteredArticles.filter(article => 
        filters.sources!.includes(article.source)
      );
    }
    
    // Filter by keywords
    if (filters.keywords?.length) {
      filteredArticles = filteredArticles.filter(article => 
        filters.keywords!.some(keyword => 
          article.title.toLowerCase().includes(keyword.toLowerCase()) ||
          article.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
    
    // Calculate relevance scores
    const articlesWithScores = filteredArticles.map(article => ({
      ...article,
      relevanceScore: this.calculateRelevanceScore(article, filters)
    }));
    
    // Sort by relevance score and recency
    articlesWithScores.sort((a, b) => {
      const scoreA = a.relevanceScore || 0;
      const scoreB = b.relevanceScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      
      // If scores are equal, sort by publish date (newer first)
      const dateA = new Date(a.pubDate || 0).getTime();
      const dateB = new Date(b.pubDate || 0).getTime();
      return dateB - dateA;
    });
    
    // Filter by minimum relevance score
    const minScore = filters.minRelevanceScore || 0;
    const relevantArticles = articlesWithScores.filter(
      article => (article.relevanceScore || 0) >= minScore
    );
    
    // Limit number of articles
    const maxArticles = filters.maxArticles || 20;
    return relevantArticles.slice(0, maxArticles);
  }

  /**
   * Calculate relevance score for an article.
   * 
   * Args:
   *   article (object): Article data.
   *   filters (object): Content filters.
   *   
   * Returns:
   *   number: Relevance score (0-100).
   */
  private calculateRelevanceScore(article: any, filters: NewsletterSchedule['contentFilters']): number {
    let score = 0;
    
    // Base score for all articles
    score += 20;
    
    // Bonus for BRICS-related content
    const bricsKeywords = ['brics', 'china', 'russia', 'india', 'brazil', 'south africa'];
    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();
    
    bricsKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 15;
      if (descLower.includes(keyword)) score += 10;
    });
    
    // Bonus for Indonesia/Bali content
    const localKeywords = ['indonesia', 'bali', 'jakarta', 'denpasar'];
    localKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 20;
      if (descLower.includes(keyword)) score += 15;
    });
    
    // Bonus for recent articles (within 24 hours)
    const publishedAt = new Date(article.pubDate || 0);
    const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
    if (hoursAgo <= 24) score += 15;
    else if (hoursAgo <= 48) score += 10;
    else if (hoursAgo <= 72) score += 5;
    
    // Bonus for trusted sources
    const trustedSources = ['RT News', 'TASS', 'Xinhua News', 'BBC Asia', 'Al Jazeera'];
    if (trustedSources.includes(article.source)) score += 10;
    
    // Keyword matching bonus
    if (filters.keywords?.length) {
      filters.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (titleLower.includes(keywordLower)) score += 12;
        if (descLower.includes(keywordLower)) score += 8;
      });
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Build newsletter sections from curated articles.
   * 
   * Args:
   *   articles (Array): Curated articles.
   *   schedule (NewsletterSchedule): Newsletter schedule.
   *   
   * Returns:
   *   Promise<Array>: Newsletter sections.
   */
  private async buildNewsletterSections(
    articles: any[], 
    schedule: NewsletterSchedule
  ): Promise<NewsletterSection[]> {
    const sections: NewsletterSection[] = [];
    
    // Header section
    sections.push({
      type: 'header',
      title: this.generateNewsletterTitle(schedule.type),
      content: this.generateHeaderContent(schedule.type)
    });
    
    if (articles.length === 0) {
      sections.push({
        type: 'category',
        title: 'No New Articles',
        content: 'We\'re working on bringing you fresh content. Check back soon!'
      });
      sections.push(this.createFooterSection());
      return sections;
    }
    
    // Featured article (highest scoring)
    const featuredArticle = articles[0];
    if (featuredArticle) {
      sections.push({
        type: 'featured',
        title: '🌟 Featured Story',
        articles: [featuredArticle]
      });
    }
    
    // Category sections
    const categorizedArticles = this.categorizeArticles(articles.slice(1));
    
    // BRICS section
    if (categorizedArticles.brics.length > 0) {
      sections.push({
        type: 'category',
        title: '🤝 BRICS & Global Politics',
        articles: categorizedArticles.brics.slice(0, 4)
      });
    }
    
    // Indonesia section
    if (categorizedArticles.indonesia.length > 0) {
      sections.push({
        type: 'category',
        title: '🇮🇩 Indonesia News',
        articles: categorizedArticles.indonesia.slice(0, 3)
      });
    }
    
    // Bali section
    if (categorizedArticles.bali.length > 0) {
      sections.push({
        type: 'category',
        title: '🏝️ Bali Updates',
        articles: categorizedArticles.bali.slice(0, 3)
      });
    }
    
    // Trending section (remaining high-scoring articles)
    const trendingArticles = articles
      .slice(1)
      .filter(article => !this.isArticleInSections(article, sections))
      .slice(0, 5);
      
    if (trendingArticles.length > 0) {
      sections.push({
        type: 'trending',
        title: '📈 Trending Stories',
        articles: trendingArticles
      });
    }
    
    // Footer section
    sections.push(this.createFooterSection());
    
    return sections;
  }

  /**
   * Categorize articles by content type.
   */
  private categorizeArticles(articles: any[]) {
    const categories = {
      brics: [] as any[],
      indonesia: [] as any[],
      bali: [] as any[],
      other: [] as any[]
    };
    
    articles.forEach(article => {
      const titleLower = article.title.toLowerCase();
      const descLower = article.description.toLowerCase();
      const content = `${titleLower} ${descLower}`;
      
      if (content.includes('bali') || content.includes('denpasar')) {
        categories.bali.push(article);
      } else if (content.includes('indonesia') || content.includes('jakarta')) {
        categories.indonesia.push(article);
      } else if (
        ['brics', 'china', 'russia', 'india', 'brazil', 'south africa']
          .some(keyword => content.includes(keyword))
      ) {
        categories.brics.push(article);
      } else {
        categories.other.push(article);
      }
    });
    
    return categories;
  }

  /**
   * Check if article is already included in sections.
   */
  private isArticleInSections(article: any, sections: NewsletterSection[]): boolean {
    return sections.some(section => 
      section.articles?.some(sectionArticle => 
        sectionArticle.url === article.url
      )
    );
  }

  /**
   * Generate newsletter title based on type.
   */
  private generateNewsletterTitle(type: string): string {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    switch (type) {
      case 'daily':
        return `Daily Brief - ${date}`;
      case 'weekly':
        return `Weekly Roundup - Week of ${date}`;
      case 'monthly':
        return `Monthly Digest - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      default:
        return `Bali Report Update - ${date}`;
    }
  }

  /**
   * Generate subject line based on articles and type.
   */
  private generateSubjectLine(articles: any[], type: string): string {
    if (articles.length === 0) {
      return `Bali Report ${type.charAt(0).toUpperCase() + type.slice(1)} Update`;
    }
    
    const featuredTitle = articles[0]?.title || '';
    const shortTitle = featuredTitle.length > 40 
      ? featuredTitle.substring(0, 37) + '...' 
      : featuredTitle;
    
    const subjects = {
      daily: [
        `🌺 Daily Brief: ${shortTitle}`,
        `🏝️ Today's Top Story: ${shortTitle}`,
        `📰 Bali Report Daily: ${shortTitle}`
      ],
      weekly: [
        `🗓️ Week's Highlights: ${shortTitle}`,
        `📊 Weekly Roundup: ${shortTitle}`,
        `🌊 This Week: ${shortTitle}`
      ],
      monthly: [
        `📅 Monthly Digest: ${shortTitle}`,
        `🌴 Month in Review: ${shortTitle}`,
        `📋 Monthly Summary: ${shortTitle}`
      ]
    };
    
    const options = subjects[type as keyof typeof subjects] || subjects.daily;
    return options[0]; // Use first option for consistency
  }

  /**
   * Generate preheader text.
   */
  private generatePreheader(articles: any[]): string {
    if (articles.length === 0) {
      return "Stay updated with the latest multi-polar news and insights.";
    }
    
    const categories = this.categorizeArticles(articles);
    const counts = {
      brics: categories.brics.length,
      indonesia: categories.indonesia.length,
      bali: categories.bali.length
    };
    
    const parts = [];
    if (counts.brics > 0) parts.push(`${counts.brics} BRICS stories`);
    if (counts.indonesia > 0) parts.push(`${counts.indonesia} Indonesia updates`);
    if (counts.bali > 0) parts.push(`${counts.bali} Bali news`);
    
    if (parts.length === 0) {
      return `${articles.length} curated stories from our global network`;
    }
    
    return parts.join(' • ') + ' and more';
  }

  /**
   * Generate header content based on newsletter type.
   */
  private generateHeaderContent(type: string): string {
    const greetings = {
      daily: "Good day! Here's your daily dose of multi-polar news.",
      weekly: "Welcome to your weekly roundup of global developments.",
      monthly: "Your comprehensive monthly digest of world events."
    };
    
    return greetings[type as keyof typeof greetings] || greetings.daily;
  }

  /**
   * Create footer section with standard content.
   */
  private createFooterSection(): NewsletterSection {
    return {
      type: 'footer',
      content: `
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>Thank you for reading Bali Report!</p>
          <p>Follow us for real-time updates and join our growing community.</p>
          <div style="margin: 15px 0;">
            <a href="https://bali.report" style="color: #14b8a6;">Visit Website</a> | 
            <a href="https://bali.report/campaigns" style="color: #14b8a6;">Support BPD</a> | 
            <a href="*|UNSUB|*" style="color: #666;">Unsubscribe</a>
          </div>
          <p style="font-size: 12px;">
            Bali Report - Multi-polar news from a tropical perspective<br>
            Powered by our community and BPD supporters
          </p>
        </div>
      `
    };
  }

  /**
   * Create and send automated newsletter campaign.
   * 
   * Args:
   *   content (NewsletterContent): Generated newsletter content.
   *   segmentIds (string[]): Audience segment IDs (optional).
   *   
   * Returns:
   *   Promise<object>: Campaign creation result.
   */
  async createAndSendCampaign(
    content: NewsletterContent, 
    segmentIds?: string[]
  ): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    if (!this.listId || !process.env.MAILCHIMP_API_KEY) {
      console.error('🚨 Mailchimp not configured for automation');
      return { success: false, error: 'Mailchimp not configured' };
    }

    try {
      // Generate HTML content from newsletter sections
      const htmlContent = await this.generateHTMLContent(content);
      
        // Create campaign
        const campaignSettings = {
          type: 'regular' as const,
          recipients: {
            list_id: this.listId,
            // Note: Segment targeting would require proper segment IDs as numbers
            // For now, send to entire list - segments can be configured later
          },
        settings: {
          subject_line: content.subject,
          preview_text: content.preheader,
          title: `${content.title} - ${content.generatedAt}`,
          from_name: 'Bali Report',
          reply_to: process.env.NEWSLETTER_REPLY_EMAIL || 'hello@bali.report',
          auto_footer: false,
          inline_css: true
        }
      };

      const campaignResult = await mailchimp.campaigns.create(campaignSettings);
      
      // Type guard to check if the response has an id property
      if (!campaignResult || typeof campaignResult !== 'object' || !('id' in campaignResult)) {
        throw new Error('Failed to create campaign - invalid response');
      }
      
      const campaign = campaignResult as { id: string };
      console.log('📧 Created campaign:', campaign.id);

      // Set campaign content
      await mailchimp.campaigns.setContent(campaign.id, {
        html: htmlContent
      });

      // Send campaign immediately (you might want to schedule instead)
      await mailchimp.campaigns.send(campaign.id);
      console.log('🚀 Newsletter sent successfully:', campaign.id);

      return { success: true, campaignId: campaign.id };

    } catch (error: any) {
      console.error('🚨 Newsletter automation error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create campaign' 
      };
    }
  }

  /**
   * Generate HTML content from newsletter sections using professional templates.
   * 
   * Args:
   *   content (NewsletterContent): Newsletter content structure.
   *   
   * Returns:
   *   Promise<string>: Complete HTML email content.
   */
  private async generateHTMLContent(content: NewsletterContent): Promise<string> {
    // Determine template type from schedule
    const templateType = this.getTemplateType(content.scheduleId);
    
    // Generate professional HTML email using template service
    return NewsletterTemplates.generateHTML(content, templateType);
  }
  
  /**
   * Get template type based on schedule ID.
   */
  private getTemplateType(scheduleId: string): 'daily' | 'weekly' | 'monthly' {
    if (scheduleId.includes('daily')) return 'daily';
    if (scheduleId.includes('weekly')) return 'weekly';
    if (scheduleId.includes('monthly')) return 'monthly';
    return 'daily'; // Default fallback
  }

  /**
   * Get newsletter campaign statistics.
   * 
   * Args:
   *   campaignId (string): Mailchimp campaign ID.
   *   
   * Returns:
   *   Promise<CampaignStats|null>: Campaign statistics.
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    if (!process.env.MAILCHIMP_API_KEY) return null;

    try {
      // Note: Mailchimp API method might be different - this is a placeholder
      const stats = await (mailchimp as any).reports.get(campaignId);
      
      return {
        opens: stats.opens.opens_total || 0,
        clicks: stats.clicks.clicks_total || 0,
        unsubscribes: stats.unsubscribed || 0,
        bounces: stats.bounces.hard_bounces + stats.bounces.soft_bounces || 0,
        openRate: stats.opens.open_rate * 100 || 0,
        clickRate: stats.clicks.click_rate * 100 || 0,
        sentCount: stats.emails_sent || 0
      };
    } catch (error) {
      console.warn('⚠️ Could not fetch campaign stats:', error);
      return null;
    }
  }
}

/**
 * Default newsletter schedules for Bali Report.
 */
export const DEFAULT_SCHEDULES: NewsletterSchedule[] = [
  {
    id: 'daily-morning',
    name: 'Daily Morning Brief',
    type: 'daily',
    frequency: 'morning',
    time: '08:00',
    templateId: 'daily-template',
    isActive: true,
    contentFilters: {
      categories: ['brics', 'indonesia', 'bali'],
      maxArticles: 12,
      minRelevanceScore: 40
    }
  },
  {
    id: 'weekly-roundup',
    name: 'Weekly Roundup',
    type: 'weekly',
    frequency: 'friday',
    time: '17:00',
    templateId: 'weekly-template',
    isActive: true,
    contentFilters: {
      categories: ['brics', 'indonesia', 'bali', 'economy', 'environment'],
      maxArticles: 20,
      minRelevanceScore: 30
    }
  },
  {
    id: 'brics-spotlight',
    name: 'BRICS Spotlight',
    type: 'weekly',
    frequency: 'monday',
    time: '12:00',
    templateId: 'brics-template',
    isActive: false,
    contentFilters: {
      categories: ['brics'],
      keywords: ['brics', 'multipolar', 'global south', 'geopolitics'],
      maxArticles: 8,
      minRelevanceScore: 60
    }
  }
];