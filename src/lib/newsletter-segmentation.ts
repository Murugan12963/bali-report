"use server";

import mailchimp from "@mailchimp/mailchimp_marketing";

export interface UserSegmentProfile {
  email: string;
  interests: string[];
  location?: string;
  userType?: 'tourist' | 'expat' | 'local' | 'global';
  engagement?: 'high' | 'medium' | 'low';
  preferredFrequency?: 'daily' | 'weekly' | 'monthly';
  topics?: string[];
  lastActive?: string;
}

export interface NewsletterSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    interests?: string[];
    location?: string[];
    userType?: string[];
    engagement?: string[];
    topics?: string[];
  };
  mailchimpSegmentId?: string;
  estimatedSize?: number;
}

/**
 * Newsletter segmentation service for targeted content delivery.
 * Manages user preferences and creates targeted email campaigns.
 */
export class NewsletterSegmentation {
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
   * Update subscriber profile with preferences and segmentation data.
   * 
   * Args:
   *   email (string): Subscriber email address.
   *   profile (UserSegmentProfile): User segmentation profile.
   *   
   * Returns:
   *   Promise<boolean>: Success status.
   */
  async updateSubscriberProfile(email: string, profile: Partial<UserSegmentProfile>): Promise<boolean> {
    if (!this.listId || !process.env.MAILCHIMP_API_KEY) {
      console.warn('⚠️ Mailchimp not configured for segmentation');
      return false;
    }

    try {
      // Create subscriber hash for Mailchimp API
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      // Prepare merge fields for Mailchimp
      const mergeFields: any = {};
      
      if (profile.location) {
        mergeFields.LOCATION = profile.location;
      }
      
      if (profile.userType) {
        mergeFields.USER_TYPE = profile.userType;
      }
      
      if (profile.engagement) {
        mergeFields.ENGAGEMENT = profile.engagement;
      }
      
      if (profile.preferredFrequency) {
        mergeFields.FREQUENCY = profile.preferredFrequency;
      }

      // Update subscriber in Mailchimp
      await mailchimp.lists.updateListMember(this.listId, subscriberHash, {
        merge_fields: mergeFields,
        // Note: Tags are managed separately via the tags API
        // tags: [...] // This property doesn't exist in UpdateListMemberBody
      });
      
      // Update tags separately if needed
      const tags = [
        ...(profile.interests || []),
        ...(profile.topics || []),
        profile.userType ? `user-${profile.userType}` : '',
      ].filter(Boolean);
      
      if (tags.length > 0) {
        // Note: This would require a separate tags API call
        console.log('Would update tags:', tags);
      }

      console.log(`✅ Updated segmentation profile for: ${email}`);
      return true;

    } catch (error: any) {
      console.error('🚨 Error updating subscriber profile:', error);
      return false;
    }
  }

  /**
   * Create or update newsletter segments in Mailchimp.
   * 
   * Args:
   *   segments (NewsletterSegment[]): Segment definitions.
   *   
   * Returns:
   *   Promise<string[]>: Created segment IDs.
   */
  async createSegments(segments: NewsletterSegment[]): Promise<string[]> {
    if (!this.listId || !process.env.MAILCHIMP_API_KEY) {
      console.warn('⚠️ Mailchimp not configured for segmentation');
      return [];
    }

    const segmentIds: string[] = [];

    for (const segment of segments) {
      try {
        // Build segment conditions based on criteria
        const conditions = this.buildSegmentConditions(segment.criteria);
        
        if (conditions.length === 0) {
          console.warn(`⚠️ No valid conditions for segment: ${segment.name}`);
          continue;
        }

        // Create segment in Mailchimp
        // Note: This is a placeholder - actual Mailchimp segment creation requires proper API
        const response = await (mailchimp as any).lists.createSegment(this.listId, {
          name: segment.name,
          options: {
            match: 'any', // OR logic - subscriber matches any condition
            conditions
          }
        });

        segmentIds.push(response.id);
        console.log(`✅ Created segment: ${segment.name} (ID: ${response.id})`);

      } catch (error: any) {
        console.error(`🚨 Error creating segment ${segment.name}:`, error);
      }
    }

    return segmentIds;
  }

  /**
   * Build Mailchimp segment conditions from criteria.
   */
  private buildSegmentConditions(criteria: NewsletterSegment['criteria']): any[] {
    const conditions: any[] = [];

    // Interest-based conditions
    if (criteria.interests?.length) {
      criteria.interests.forEach(interest => {
        conditions.push({
          condition_type: 'TextMerge',
          field: 'INTERESTS',
          op: 'contains',
          value: interest
        });
      });
    }

    // Location-based conditions  
    if (criteria.location?.length) {
      criteria.location.forEach(location => {
        conditions.push({
          condition_type: 'TextMerge',
          field: 'LOCATION',
          op: 'contains',
          value: location
        });
      });
    }

    // User type conditions
    if (criteria.userType?.length) {
      criteria.userType.forEach(userType => {
        conditions.push({
          condition_type: 'TextMerge',
          field: 'USER_TYPE',
          op: 'is',
          value: userType
        });
      });
    }

    // Engagement conditions
    if (criteria.engagement?.length) {
      criteria.engagement.forEach(engagement => {
        conditions.push({
          condition_type: 'TextMerge',
          field: 'ENGAGEMENT',
          op: 'is',
          value: engagement
        });
      });
    }

    // Topic-based tag conditions
    if (criteria.topics?.length) {
      criteria.topics.forEach(topic => {
        conditions.push({
          condition_type: 'StaticSegment',
          field: 'static_segment',
          op: 'static_is',
          value: topic
        });
      });
    }

    return conditions;
  }

  /**
   * Get subscriber segments for targeted newsletter sending.
   * 
   * Returns:
   *   Promise<NewsletterSegment[]>: Available newsletter segments.
   */
  async getNewsletterSegments(): Promise<NewsletterSegment[]> {
    // Return predefined segments - in a full implementation, 
    // you might fetch these from a database or configuration
    return DEFAULT_NEWSLETTER_SEGMENTS;
  }

  /**
   * Determine optimal segments for a newsletter based on content.
   * 
   * Args:
   *   contentCategories (string[]): Newsletter content categories.
   *   
   * Returns:
   *   Promise<string[]>: Recommended segment IDs.
   */
  async getOptimalSegmentsForContent(contentCategories: string[]): Promise<string[]> {
    const segments = await this.getNewsletterSegments();
    const recommendedSegments: string[] = [];

    for (const segment of segments) {
      // Check if segment criteria match content categories
      const hasMatchingInterests = segment.criteria.interests?.some(interest =>
        contentCategories.some(category => 
          category.toLowerCase().includes(interest.toLowerCase())
        )
      );

      const hasMatchingTopics = segment.criteria.topics?.some(topic =>
        contentCategories.some(category => 
          category.toLowerCase().includes(topic.toLowerCase())
        )
      );

      if (hasMatchingInterests || hasMatchingTopics) {
        if (segment.mailchimpSegmentId) {
          recommendedSegments.push(segment.mailchimpSegmentId);
        }
      }
    }

    return recommendedSegments;
  }

  /**
   * Calculate engagement score for segmentation.
   * 
   * Args:
   *   email (string): Subscriber email.
   *   
   * Returns:
   *   Promise<'high'|'medium'|'low'>: Engagement level.
   */
  async calculateEngagementScore(email: string): Promise<'high' | 'medium' | 'low'> {
    if (!this.listId || !process.env.MAILCHIMP_API_KEY) {
      return 'medium'; // Default fallback
    }

    try {
      const subscriberHash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      const memberResult = await mailchimp.lists.getListMember(this.listId, subscriberHash);
      
      // Type guard and calculate engagement based on Mailchimp data
      const member = memberResult as any; // Cast to any to access stats
      const openRate = member.stats?.avg_open_rate || 0;
      const clickRate = member.stats?.avg_click_rate || 0;
      
      // Engagement scoring logic
      if (openRate > 0.4 || clickRate > 0.1) {
        return 'high';
      } else if (openRate > 0.2 || clickRate > 0.05) {
        return 'medium';
      } else {
        return 'low';
      }

    } catch (error) {
      console.warn('⚠️ Could not calculate engagement score:', error);
      return 'medium';
    }
  }

  /**
   * Auto-segment subscriber based on behavior and preferences.
   * 
   * Args:
   *   email (string): Subscriber email.
   *   behaviorData (object): User behavior data.
   *   
   * Returns:
   *   Promise<UserSegmentProfile>: Generated segment profile.
   */
  async autoSegmentSubscriber(
    email: string, 
    behaviorData: {
      articlesViewed?: string[];
      categoriesViewed?: string[];
      timeOnSite?: number;
      deviceType?: string;
      location?: string;
    }
  ): Promise<UserSegmentProfile> {
    // Determine user type based on behavior
    let userType: UserSegmentProfile['userType'] = 'global';
    
    if (behaviorData.location?.toLowerCase().includes('bali') || 
        behaviorData.categoriesViewed?.includes('bali')) {
      userType = 'local';
    } else if (behaviorData.location?.toLowerCase().includes('indonesia') ||
               behaviorData.categoriesViewed?.includes('indonesia')) {
      userType = 'expat';
    } else if (behaviorData.categoriesViewed?.some(cat => 
               ['tourism', 'travel', 'bali events'].includes(cat.toLowerCase()))) {
      userType = 'tourist';
    }

    // Determine interests from viewed categories
    const interests: string[] = [];
    if (behaviorData.categoriesViewed) {
      behaviorData.categoriesViewed.forEach(category => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('brics')) interests.push('brics-news');
        if (categoryLower.includes('indonesia')) interests.push('indonesia-news');
        if (categoryLower.includes('bali')) interests.push('bali-events');
        if (categoryLower.includes('economy')) interests.push('economy');
        if (categoryLower.includes('environment')) interests.push('environment');
        if (categoryLower.includes('tourism')) interests.push('tourism');
      });
    }

    // Calculate engagement based on time on site
    let engagement: UserSegmentProfile['engagement'] = 'medium';
    if (behaviorData.timeOnSite) {
      if (behaviorData.timeOnSite > 300) { // 5+ minutes
        engagement = 'high';
      } else if (behaviorData.timeOnSite < 60) { // Less than 1 minute
        engagement = 'low';
      }
    }

    // Suggest frequency based on engagement and user type
    let preferredFrequency: UserSegmentProfile['preferredFrequency'] = 'weekly';
    if (engagement === 'high') {
      preferredFrequency = 'daily';
    } else if (engagement === 'low') {
      preferredFrequency = 'monthly';
    }

    const profile: UserSegmentProfile = {
      email,
      interests: [...new Set(interests)], // Remove duplicates
      location: behaviorData.location,
      userType,
      engagement,
      preferredFrequency,
      topics: behaviorData.categoriesViewed || [],
      lastActive: new Date().toISOString()
    };

    // Update the subscriber profile in Mailchimp
    await this.updateSubscriberProfile(email, profile);

    return profile;
  }
}

/**
 * Predefined newsletter segments for Bali Report.
 */
export const DEFAULT_NEWSLETTER_SEGMENTS: NewsletterSegment[] = [
  {
    id: 'brics-enthusiasts',
    name: 'BRICS Enthusiasts',
    description: 'Users interested in BRICS politics and multipolar world coverage',
    criteria: {
      interests: ['brics-news', 'geopolitics'],
      topics: ['brics', 'multipolar', 'global-south'],
      engagement: ['high', 'medium']
    }
  },
  {
    id: 'indonesia-locals',
    name: 'Indonesia Locals',
    description: 'Local Indonesian readers interested in national news',
    criteria: {
      location: ['Indonesia', 'Jakarta', 'Bali', 'Denpasar'],
      interests: ['indonesia-news', 'bali-events'],
      userType: ['local', 'expat']
    }
  },
  {
    id: 'bali-tourists',
    name: 'Bali Tourists & Travelers',
    description: 'Travelers and tourists interested in Bali content',
    criteria: {
      interests: ['tourism', 'bali-events'],
      topics: ['travel', 'culture'],
      userType: ['tourist']
    }
  },
  {
    id: 'high-engagement',
    name: 'High Engagement Subscribers',
    description: 'Most active subscribers who engage frequently',
    criteria: {
      engagement: ['high']
    }
  },
  {
    id: 'daily-digest',
    name: 'Daily Digest Subscribers',
    description: 'Users who prefer daily news updates',
    criteria: {
      interests: ['brics-news', 'indonesia-news'],
      engagement: ['high', 'medium']
    }
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary Subscribers', 
    description: 'Users who prefer weekly roundups',
    criteria: {
      engagement: ['medium', 'low']
    }
  },
  {
    id: 'global-audience',
    name: 'Global Audience',
    description: 'International readers interested in multipolar perspectives',
    criteria: {
      userType: ['global'],
      interests: ['brics-news', 'economy'],
      topics: ['geopolitics', 'global-south']
    }
  }
];

/**
 * Helper function to segment newsletter content by audience type.
 * 
 * Args:
 *   articles (Array): Newsletter articles.
 *   segmentId (string): Target segment ID.
 *   
 * Returns:
 *   Array: Filtered and prioritized articles for segment.
 */
export function customizeContentForSegment(articles: any[], segmentId: string): any[] {
  const segment = DEFAULT_NEWSLETTER_SEGMENTS.find(s => s.id === segmentId);
  if (!segment) return articles;

  // Filter articles based on segment criteria
  let filteredArticles = articles.filter(article => {
    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();
    const content = `${titleLower} ${descLower}`;

    // Check if article matches segment interests
    const matchesInterests = segment.criteria.interests?.some(interest => {
      switch (interest) {
        case 'brics-news':
          return ['brics', 'china', 'russia', 'india', 'brazil', 'south africa']
            .some(keyword => content.includes(keyword));
        case 'indonesia-news':
          return ['indonesia', 'jakarta'].some(keyword => content.includes(keyword));
        case 'bali-events':
          return ['bali', 'denpasar'].some(keyword => content.includes(keyword));
        case 'tourism':
          return ['tourism', 'travel', 'culture'].some(keyword => content.includes(keyword));
        case 'economy':
          return ['economy', 'trade', 'business'].some(keyword => content.includes(keyword));
        case 'environment':
          return ['environment', 'climate', 'sustainability'].some(keyword => content.includes(keyword));
        default:
          return content.includes(interest.replace('-', ' '));
      }
    }) || false;

    // Check if article matches segment topics
    const matchesTopics = segment.criteria.topics?.some(topic =>
      content.includes(topic.replace('-', ' '))
    ) || false;

    return matchesInterests || matchesTopics;
  });

  // If no matches found, return a subset of general articles
  if (filteredArticles.length === 0) {
    filteredArticles = articles.slice(0, 5);
  }

  // Customize article count based on engagement level
  const maxArticles = segment.criteria.engagement?.includes('high') ? 15 : 
                     segment.criteria.engagement?.includes('low') ? 8 : 10;

  return filteredArticles.slice(0, maxArticles);
}