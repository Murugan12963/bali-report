import { userContentModerationService, UserContentModerationService } from '../user-content-moderation';

describe('UserContentModerationService', () => {
  let moderationService: UserContentModerationService;

  beforeEach(() => {
    moderationService = new UserContentModerationService();
  });

  describe('Vote Validation', () => {
    test('should allow normal voting behavior', async () => {
      const result = await moderationService.validateVote(
        'user123',
        'article456',
        'up',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      expect(result.allowed).toBe(true);
      expect(result.confidence).toBe(1.0);
      expect(result.reason).toBeUndefined();
    });

    test('should prevent rapid voting from same user', async () => {
      const userId = 'rapid_voter';
      const articleId = 'article1';

      // Simulate 11 votes in quick succession
      for (let i = 0; i < 11; i++) {
        await moderationService.validateVote(
          userId,
          `article${i}`,
          'up',
          '192.168.1.1',
          'Mozilla/5.0...'
        );
      }

      // The 12th vote should be blocked
      const result = await moderationService.validateVote(
        userId,
        'article12',
        'up',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/Too many votes in short time|flagged for suspicious voting behavior/);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should prevent duplicate votes on same article', async () => {
      const userId = 'user123';
      const articleId = 'article456';

      // First vote should be allowed
      const firstVote = await moderationService.validateVote(userId, articleId, 'up');
      expect(firstVote.allowed).toBe(true);

      // Immediate second vote on same article should be blocked
      const secondVote = await moderationService.validateVote(userId, articleId, 'down');
      expect(secondVote.allowed).toBe(false);
      expect(secondVote.reason).toContain('Already voted on this article recently');
    });

    test('should limit votes per IP address', async () => {
      const ipAddress = '192.168.1.100';
      
      // Simulate 21 votes from same IP
      for (let i = 0; i < 21; i++) {
        await moderationService.validateVote(
          `user${i}`,
          `article${i}`,
          'up',
          ipAddress,
          'Mozilla/5.0...'
        );
      }

      // 22nd vote from same IP should be blocked
      const result = await moderationService.validateVote(
        'newuser',
        'newarticle',
        'up',
        ipAddress,
        'Mozilla/5.0...'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Too many votes from this IP address');
    });

    test('should reject votes from flagged users', async () => {
      const suspiciousUserId = 'suspicious_user';

      // First, trigger suspicious behavior detection
      for (let i = 0; i < 11; i++) {
        await moderationService.validateVote(
          suspiciousUserId,
          `article${i}`,
          'up',
          '192.168.1.1',
          'Mozilla/5.0...'
        );
      }

      // This should flag the user and reject subsequent votes
      const result = await moderationService.validateVote(
        suspiciousUserId,
        'another_article',
        'up',
        '192.168.1.2',
        'Mozilla/5.0...'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('flagged for suspicious voting behavior');
    });
  });

  describe('User Reporting', () => {
    test('should accept valid user reports', async () => {
      const report = await moderationService.submitReport(
        'reporter123',
        'article',
        'article456',
        'spam',
        'This article is clearly promotional spam content advertising products.'
      );

      expect(report.id).toBeDefined();
      expect(report.status).toBe('pending');
      expect(report.reporterId).toBe('reporter123');
      expect(report.contentType).toBe('article');
      expect(report.reason).toBe('spam');
    });

    test('should handle vote manipulation reports specially', async () => {
      const report = await moderationService.submitReport(
        'reporter456',
        'user',
        'suspicious_voter',
        'vote_manipulation',
        'This user is gaming the voting system with multiple rapid votes.'
      );

      expect(report.id).toBeDefined();
      expect(report.status).toBe('pending');
      expect(report.reason).toBe('vote_manipulation');
      
      // The reported user should be automatically flagged
      const pendingReports = moderationService.getPendingReports();
      expect(pendingReports).toContainEqual(expect.objectContaining({
        contentId: 'suspicious_voter',
        reason: 'vote_manipulation'
      }));
    });

    test('should return pending reports correctly', async () => {
      // Submit multiple reports
      await moderationService.submitReport('user1', 'article', 'article1', 'spam', 'Spam content detected');
      await moderationService.submitReport('user2', 'article', 'article2', 'inappropriate', 'Inappropriate content');
      
      const pendingReports = moderationService.getPendingReports();
      
      expect(pendingReports).toHaveLength(2);
      expect(pendingReports).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'pending',
            reason: 'spam'
          }),
          expect.objectContaining({
            status: 'pending',
            reason: 'inappropriate'
          })
        ])
      );
    });
  });

  describe('Report Review', () => {
    test('should allow admins to review and resolve reports', async () => {
      const report = await moderationService.submitReport(
        'reporter',
        'article',
        'bad_article',
        'misinformation',
        'This article contains false information.'
      );

      const reviewedReport = await moderationService.reviewReport(
        report.id,
        'admin123',
        'warn',
        'Content flagged for review with content author.'
      );

      expect(reviewedReport).toBeDefined();
      expect(reviewedReport!.status).toBe('resolved');
      expect(reviewedReport!.actionTaken).toBe('warn');
      expect(reviewedReport!.reviewerId).toBe('admin123');
      expect(reviewedReport!.reviewNotes).toContain('flagged for review');
    });

    test('should allow admins to dismiss invalid reports', async () => {
      const report = await moderationService.submitReport(
        'reporter',
        'article',
        'normal_article',
        'spam',
        'False report for testing.'
      );

      const reviewedReport = await moderationService.reviewReport(
        report.id,
        'admin456',
        'dismiss',
        'Report appears to be invalid after review.'
      );

      expect(reviewedReport).toBeDefined();
      expect(reviewedReport!.status).toBe('dismissed');
      expect(reviewedReport!.actionTaken).toBe('dismiss');
    });

    test('should return null for non-existent report IDs', async () => {
      const result = await moderationService.reviewReport(
        'nonexistent_report',
        'admin',
        'dismiss',
        'Notes'
      );

      expect(result).toBeNull();
    });
  });

  describe('Moderation Statistics', () => {
    test('should return accurate moderation statistics', async () => {
      // Submit some reports and reviews
      const report1 = await moderationService.submitReport('user1', 'article', 'article1', 'spam', 'Spam content');
      const report2 = await moderationService.submitReport('user2', 'article', 'article2', 'vote_manipulation', 'Vote gaming');
      
      await moderationService.reviewReport(report1.id, 'admin', 'warn', 'Warned user');

      const stats = moderationService.getModerationStats();

      expect(stats.totalReports).toBe(2);
      expect(stats.pendingReports).toBe(1); // One resolved, one pending
      expect(stats.resolvedReports).toBe(1);
      expect(stats.voteManipulationDetected).toBe(1);
    });

    test('should return zero stats for new service instance', () => {
      const freshService = new UserContentModerationService();
      const stats = freshService.getModerationStats();

      expect(stats.totalReports).toBe(0);
      expect(stats.pendingReports).toBe(0);
      expect(stats.resolvedReports).toBe(0);
      expect(stats.suspiciousUsers).toBe(0);
      expect(stats.voteManipulationDetected).toBe(0);
      expect(stats.actionsThisWeek).toBe(0);
    });
  });

  describe('Suspicious Activity Analysis', () => {
    test('should detect rapid voting patterns', async () => {
      const userId = 'rapid_user';
      
      // Simulate rapid voting behavior
      for (let i = 0; i < 15; i++) {
        await moderationService.validateVote(userId, `article${i}`, 'up');
      }

      const activities = await moderationService.analyzeSuspiciousActivity(userId);

      expect(activities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: userId,
            activityType: 'rapid_voting',
            severity: expect.stringMatching(/medium|high/)
          })
        ])
      );
    });

    test('should return empty array for users with no activity', async () => {
      const activities = await moderationService.analyzeSuspiciousActivity('inactive_user');
      expect(activities).toHaveLength(0);
    });

    test('should detect voting bias patterns', async () => {
      const biasedUserId = 'biased_user';
      
      // Simulate user who only upvotes (22 votes, all upvotes)
      for (let i = 0; i < 22; i++) {
        await moderationService.validateVote(biasedUserId, `article${i}`, 'up');
      }

      const activities = await moderationService.analyzeSuspiciousActivity(biasedUserId);

      expect(activities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            activityType: 'vote_pattern',
            severity: 'medium',
            evidence: expect.objectContaining({
              pattern: 'always_positive'
            })
          })
        ])
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing IP address gracefully', async () => {
      const result = await moderationService.validateVote(
        'user123',
        'article456',
        'up'
        // No IP address provided
      );

      expect(result.allowed).toBe(true);
      expect(result.confidence).toBe(1.0);
    });

    test('should handle unusual user IDs', async () => {
      const result = await moderationService.validateVote(
        'user_with_special_chars_123!@#',
        'article-with-dashes',
        'up',
        '2001:db8::1', // IPv6 address
        'Complex User Agent String (Test)'
      );

      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
      expect(typeof result.confidence).toBe('number');
    });

    test('should handle concurrent vote validation requests', async () => {
      const promises = [];
      
      // Submit 5 concurrent vote validation requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          moderationService.validateVote(`user${i}`, `article${i}`, 'up')
        );
      }

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.allowed).toBeDefined();
      });
    });
  });
});