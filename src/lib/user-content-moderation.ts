/**
 * User-Generated Content Moderation Service for Bali Report
 * Handles vote manipulation, spam prevention, and user reporting
 */

export interface UserReport {
  id: string;
  reporterId: string;
  contentType: 'article' | 'vote' | 'comment' | 'user';
  contentId: string;
  reason: 'spam' | 'inappropriate' | 'misinformation' | 'harassment' | 'vote_manipulation' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewerId?: string;
  reviewNotes?: string;
  actionTaken?: string;
}

export interface VotePattern {
  userId: string;
  articleId: string;
  voteType: 'up' | 'down';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SuspiciousActivity {
  userId: string;
  activityType: 'rapid_voting' | 'vote_pattern' | 'account_creation' | 'suspicious_behavior';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
  evidence: Record<string, any>;
  timestamp: string;
}

export interface UserModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  suspiciousUsers: number;
  voteManipulationDetected: number;
  actionsThisWeek: number;
}

/**
 * User-Generated Content Moderation Service
 * Handles community features, voting integrity, and user behavior
 */
export class UserContentModerationService {
  private votePatterns = new Map<string, VotePattern[]>(); // userId -> vote history
  private suspiciousUsers = new Set<string>();
  private reports = new Map<string, UserReport>();
  private ipVoteCounts = new Map<string, { count: number, lastVote: number }>(); // IP tracking

  // Configuration
  private readonly MAX_VOTES_PER_HOUR = 50;
  private readonly MAX_VOTES_PER_IP_PER_HOUR = 20;
  private readonly SUSPICIOUS_VOTE_THRESHOLD = 0.8;
  private readonly RAPID_VOTING_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Validate a user's vote for potential manipulation.
   * 
   * Args:
   *   userId (string): User attempting to vote.
   *   articleId (string): Article being voted on.
   *   voteType ('up' | 'down'): Type of vote.
   *   ipAddress (string): User's IP address.
   *   userAgent (string): User's browser user agent.
   * 
   * Returns:
   *   Promise<{ allowed: boolean, reason?: string, confidence: number }>
   */
  async validateVote(
    userId: string,
    articleId: string,
    voteType: 'up' | 'down',
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ allowed: boolean; reason?: string; confidence: number }> {
    
    // Check if user is already flagged as suspicious
    if (this.suspiciousUsers.has(userId)) {
      return {
        allowed: false,
        reason: 'User account flagged for suspicious voting behavior',
        confidence: 0.9
      };
    }

    // Get user's vote history
    const userVotes = this.votePatterns.get(userId) || [];
    
    // 1. Check for rapid voting (too many votes in short time)
    const rapidVotingCheck = this.checkRapidVoting(userVotes);
    if (!rapidVotingCheck.allowed) {
      await this.flagSuspiciousActivity(userId, 'rapid_voting', 'high', rapidVotingCheck.reason, {
        votesInWindow: rapidVotingCheck.votesInWindow,
        timeWindow: this.RAPID_VOTING_WINDOW
      });
      
      return {
        allowed: false,
        reason: rapidVotingCheck.reason,
        confidence: 0.8
      };
    }

    // 2. Check hourly vote limits
    const hourlyCheck = this.checkHourlyVoteLimits(userVotes);
    if (!hourlyCheck.allowed) {
      return {
        allowed: false,
        reason: `Exceeded hourly vote limit (${this.MAX_VOTES_PER_HOUR} votes per hour)`,
        confidence: 0.9
      };
    }

    // 3. Check IP-based voting limits
    if (ipAddress) {
      const ipCheck = this.checkIPVoteLimits(ipAddress);
      if (!ipCheck.allowed) {
        return {
          allowed: false,
          reason: `Too many votes from this IP address (${this.MAX_VOTES_PER_IP_PER_HOUR} per hour)`,
          confidence: 0.7
        };
      }
    }

    // 4. Check for vote pattern manipulation
    const patternCheck = await this.checkVotePatterns(userId, articleId, voteType, userVotes);
    if (!patternCheck.allowed) {
      await this.flagSuspiciousActivity(userId, 'vote_pattern', 'medium', patternCheck.reason, {
        pattern: patternCheck.pattern,
        confidence: patternCheck.confidence
      });
      
      return {
        allowed: false,
        reason: patternCheck.reason,
        confidence: patternCheck.confidence
      };
    }

    // Vote is allowed - record it
    const votePattern: VotePattern = {
      userId,
      articleId,
      voteType,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent
    };

    // Store vote pattern
    if (!this.votePatterns.has(userId)) {
      this.votePatterns.set(userId, []);
    }
    this.votePatterns.get(userId)!.push(votePattern);

    // Update IP tracking
    if (ipAddress) {
      const ipData = this.ipVoteCounts.get(ipAddress) || { count: 0, lastVote: 0 };
      ipData.count++;
      ipData.lastVote = Date.now();
      this.ipVoteCounts.set(ipAddress, ipData);
    }

    return { allowed: true, confidence: 1.0 };
  }

  /**
   * Submit a user report for content or behavior.
   * 
   * Args:
   *   reporterId (string): User making the report.
   *   contentType ('article' | 'vote' | 'comment' | 'user'): Type of content reported.
   *   contentId (string): ID of content being reported.
   *   reason (string): Reason for report.
   *   description (string): Detailed description.
   * 
   * Returns:
   *   Promise<UserReport>: Created report object.
   */
  async submitReport(
    reporterId: string,
    contentType: 'article' | 'vote' | 'comment' | 'user',
    contentId: string,
    reason: 'spam' | 'inappropriate' | 'misinformation' | 'harassment' | 'vote_manipulation' | 'other',
    description: string
  ): Promise<UserReport> {
    
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const report: UserReport = {
      id: reportId,
      reporterId,
      contentType,
      contentId,
      reason,
      description: description.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Store the report
    this.reports.set(reportId, report);

    // If it's a vote manipulation report, immediately flag for review
    if (reason === 'vote_manipulation') {
      await this.handleVoteManipulationReport(report);
    }

    console.log(`📋 New user report: ${reason} for ${contentType} ${contentId}`);
    
    return report;
  }

  /**
   * Get all pending reports for admin review.
   * 
   * Returns:
   *   UserReport[]: Array of pending reports.
   */
  getPendingReports(): UserReport[] {
    return Array.from(this.reports.values())
      .filter(report => report.status === 'pending')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Review and resolve a user report.
   * 
   * Args:
   *   reportId (string): Report to review.
   *   reviewerId (string): Admin reviewing the report.
   *   action ('dismiss' | 'warn' | 'suspend' | 'ban'): Action to take.
   *   notes (string): Review notes.
   * 
   * Returns:
   *   Promise<UserReport | null>: Updated report or null if not found.
   */
  async reviewReport(
    reportId: string,
    reviewerId: string,
    action: 'dismiss' | 'warn' | 'suspend' | 'ban',
    notes: string
  ): Promise<UserReport | null> {
    
    const report = this.reports.get(reportId);
    if (!report) {
      return null;
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    report.reviewerId = reviewerId;
    report.reviewNotes = notes;
    report.actionTaken = action;

    // Take action based on review decision
    if (action !== 'dismiss') {
      await this.takeModeratorAction(report, action);
    }

    console.log(`✅ Report ${reportId} reviewed: ${action}`);
    
    return report;
  }

  /**
   * Get user moderation statistics.
   * 
   * Returns:
   *   UserModerationStats: Current moderation statistics.
   */
  getModerationStats(): UserModerationStats {
    const reports = Array.from(this.reports.values());
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    return {
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      resolvedReports: reports.filter(r => r.status === 'resolved').length,
      suspiciousUsers: this.suspiciousUsers.size,
      voteManipulationDetected: reports.filter(r => r.reason === 'vote_manipulation').length,
      actionsThisWeek: reports.filter(r => 
        r.status !== 'pending' && 
        new Date(r.timestamp).getTime() > weekAgo
      ).length
    };
  }

  /**
   * Check for suspicious voting patterns in user history.
   * 
   * Args:
   *   userId (string): User to check.
   * 
   * Returns:
   *   Promise<SuspiciousActivity[]>: Array of suspicious activities found.
   */
  async analyzeSuspiciousActivity(userId: string): Promise<SuspiciousActivity[]> {
    const activities: SuspiciousActivity[] = [];
    const userVotes = this.votePatterns.get(userId) || [];

    if (userVotes.length === 0) {
      return activities;
    }

    // Check for rapid consecutive voting
    const rapidVoting = this.analyzeRapidVoting(userVotes);
    if (rapidVoting) {
      activities.push(rapidVoting);
    }

    // Check for suspicious voting patterns (always upvote/downvote same sources)
    const patternActivity = this.analyzeVotingPatterns(userVotes);
    if (patternActivity) {
      activities.push(patternActivity);
    }

    // Check for vote timing patterns (bot-like behavior)
    const timingActivity = this.analyzeVoteTiming(userVotes);
    if (timingActivity) {
      activities.push(timingActivity);
    }

    return activities;
  }

  // PRIVATE METHODS

  /**
   * Check if user is voting too rapidly.
   */
  private checkRapidVoting(userVotes: VotePattern[]): { 
    allowed: boolean; 
    reason: string; 
    votesInWindow: number 
  } {
    const now = Date.now();
    const windowStart = now - this.RAPID_VOTING_WINDOW;
    
    const recentVotes = userVotes.filter(vote => 
      new Date(vote.timestamp).getTime() > windowStart
    );

    if (recentVotes.length >= 10) { // More than 10 votes in 5 minutes
      return {
        allowed: false,
        reason: `Too many votes in short time: ${recentVotes.length} votes in 5 minutes`,
        votesInWindow: recentVotes.length
      };
    }

    return { allowed: true, reason: '', votesInWindow: recentVotes.length };
  }

  /**
   * Check hourly vote limits.
   */
  private checkHourlyVoteLimits(userVotes: VotePattern[]): { allowed: boolean; reason: string } {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const votesLastHour = userVotes.filter(vote => 
      new Date(vote.timestamp).getTime() > oneHourAgo
    ).length;

    if (votesLastHour >= this.MAX_VOTES_PER_HOUR) {
      return {
        allowed: false,
        reason: `Exceeded hourly vote limit: ${votesLastHour}/${this.MAX_VOTES_PER_HOUR}`
      };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * Check IP-based vote limits.
   */
  private checkIPVoteLimits(ipAddress: string): { allowed: boolean; reason: string } {
    const ipData = this.ipVoteCounts.get(ipAddress);
    if (!ipData) {
      return { allowed: true, reason: '' };
    }

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Reset counter if last vote was more than an hour ago
    if (ipData.lastVote < oneHourAgo) {
      ipData.count = 0;
    }

    if (ipData.count >= this.MAX_VOTES_PER_IP_PER_HOUR) {
      return {
        allowed: false,
        reason: `IP address exceeded hourly vote limit: ${ipData.count}/${this.MAX_VOTES_PER_IP_PER_HOUR}`
      };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * Check for suspicious voting patterns.
   */
  private async checkVotePatterns(
    userId: string,
    articleId: string,
    voteType: 'up' | 'down',
    userVotes: VotePattern[]
  ): Promise<{ allowed: boolean; reason: string; confidence: number; pattern?: string }> {
    
    // Check if user always votes the same way
    if (userVotes.length >= 20) {
      const upVotes = userVotes.filter(v => v.voteType === 'up').length;
      const downVotes = userVotes.filter(v => v.voteType === 'down').length;
      const total = upVotes + downVotes;
      
      const upRatio = upVotes / total;
      const downRatio = downVotes / total;
      
      // If user votes 90%+ in one direction, it's suspicious
      if (upRatio > 0.9 || downRatio > 0.9) {
        return {
          allowed: false,
          reason: `Suspicious voting pattern: ${(upRatio > 0.9 ? upRatio : downRatio) * 100}% votes in one direction`,
          confidence: 0.8,
          pattern: upRatio > 0.9 ? 'always_upvote' : 'always_downvote'
        };
      }
    }

    // Check if user has already voted on this article recently
    const existingVote = userVotes.find(vote => 
      vote.articleId === articleId && 
      Date.now() - new Date(vote.timestamp).getTime() < 60000 // Within last minute
    );

    if (existingVote) {
      return {
        allowed: false,
        reason: 'Already voted on this article recently',
        confidence: 1.0,
        pattern: 'duplicate_vote'
      };
    }

    return { allowed: true, reason: '', confidence: 1.0 };
  }

  /**
   * Flag suspicious user activity.
   */
  private async flagSuspiciousActivity(
    userId: string,
    activityType: 'rapid_voting' | 'vote_pattern' | 'account_creation' | 'suspicious_behavior',
    severity: 'low' | 'medium' | 'high',
    description: string,
    evidence: Record<string, any>
  ): Promise<void> {
    
    // Add user to suspicious list
    this.suspiciousUsers.add(userId);

    // In a real implementation, this would be logged to database
    console.warn(`🚨 Suspicious activity detected: ${userId} - ${activityType} (${severity})`);
    console.warn(`📋 Details: ${description}`);
    
    // If high severity, create automatic report
    if (severity === 'high') {
      await this.submitReport(
        'system',
        'user',
        userId,
        'vote_manipulation',
        `Automatic detection: ${description}`
      );
    }
  }

  /**
   * Handle vote manipulation reports with immediate action.
   */
  private async handleVoteManipulationReport(report: UserReport): Promise<void> {
    // Immediately flag the user for review
    if (report.contentType === 'user' || report.contentType === 'vote') {
      this.suspiciousUsers.add(report.contentId);
    }

    // Escalate high-confidence reports
    console.warn(`🚨 Vote manipulation reported: ${report.contentType} ${report.contentId}`);
  }

  /**
   * Take moderator action based on report resolution.
   */
  private async takeModeratorAction(
    report: UserReport,
    action: 'warn' | 'suspend' | 'ban'
  ): Promise<void> {
    
    console.log(`⚖️ Taking action: ${action} for report ${report.id}`);
    
    // In real implementation, these would trigger actual user account actions
    switch (action) {
      case 'warn':
        // Send warning message to user
        console.log(`⚠️ Warning sent to user for: ${report.reason}`);
        break;
      case 'suspend':
        // Temporarily suspend user account
        console.log(`🔒 User suspended for: ${report.reason}`);
        break;
      case 'ban':
        // Permanently ban user account
        console.log(`🚫 User banned for: ${report.reason}`);
        break;
    }
  }

  /**
   * Analyze rapid voting patterns.
   */
  private analyzeRapidVoting(userVotes: VotePattern[]): SuspiciousActivity | null {
    // Check for votes within very short time periods
    const sortedVotes = userVotes.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let rapidVotingCount = 0;
    for (let i = 1; i < sortedVotes.length; i++) {
      const timeDiff = new Date(sortedVotes[i].timestamp).getTime() - 
                      new Date(sortedVotes[i-1].timestamp).getTime();
      
      if (timeDiff < 2000) { // Less than 2 seconds between votes
        rapidVotingCount++;
      }
    }

    if (rapidVotingCount > 5) {
      return {
        userId: userVotes[0].userId,
        activityType: 'rapid_voting',
        severity: 'high',
        description: `${rapidVotingCount} votes within 2-second intervals`,
        confidence: 0.9,
        evidence: { rapidVoteCount: rapidVotingCount, totalVotes: userVotes.length },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Analyze voting patterns for bias.
   */
  private analyzeVotingPatterns(userVotes: VotePattern[]): SuspiciousActivity | null {
    if (userVotes.length < 10) return null;

    const upVotes = userVotes.filter(v => v.voteType === 'up').length;
    const downVotes = userVotes.filter(v => v.voteType === 'down').length;
    const total = upVotes + downVotes;

    const bias = Math.max(upVotes, downVotes) / total;

    if (bias > 0.95) {
      return {
        userId: userVotes[0].userId,
        activityType: 'vote_pattern',
        severity: 'medium',
        description: `Extreme voting bias: ${(bias * 100).toFixed(1)}% votes in one direction`,
        confidence: 0.8,
        evidence: { 
          upVotes, 
          downVotes, 
          bias: bias,
          pattern: upVotes > downVotes ? 'always_positive' : 'always_negative'
        },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Analyze vote timing for bot-like behavior.
   */
  private analyzeVoteTiming(userVotes: VotePattern[]): SuspiciousActivity | null {
    if (userVotes.length < 10) return null;

    // Check for regular intervals (bot behavior)
    const intervals: number[] = [];
    const sortedVotes = userVotes.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 1; i < sortedVotes.length; i++) {
      const interval = new Date(sortedVotes[i].timestamp).getTime() - 
                      new Date(sortedVotes[i-1].timestamp).getTime();
      intervals.push(interval);
    }

    // Check for suspiciously regular intervals
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;
    
    const stdDev = Math.sqrt(variance);
    const coefficient = stdDev / avgInterval;

    // Very low coefficient of variation indicates bot-like regular timing
    if (coefficient < 0.2 && intervals.length >= 10) {
      return {
        userId: userVotes[0].userId,
        activityType: 'suspicious_behavior',
        severity: 'medium',
        description: `Suspiciously regular vote timing (coefficient: ${coefficient.toFixed(3)})`,
        confidence: 0.7,
        evidence: { 
          avgInterval: Math.round(avgInterval),
          stdDev: Math.round(stdDev),
          coefficient,
          totalVotes: intervals.length + 1
        },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }
}

// Export singleton instance
export const userContentModerationService = new UserContentModerationService();