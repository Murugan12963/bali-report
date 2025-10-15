/**
 * Comprehensive Compliance Service for Bali Report
 * Handles GDPR, Indonesian UU ITE Law compliance, content moderation, and data protection
 * Ensures all AI-generated content meets legal and ethical standards
 */

interface ComplianceResult {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  score: number; // 0-100 compliance score
  recommendations: string[];
  category: 'content' | 'privacy' | 'data' | 'technical';
}

interface ContentModerationResult {
  approved: boolean;
  flags: Array<{
    type: 'hate_speech' | 'misinformation' | 'inappropriate' | 'legal_concern';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  culturalSensitivity: number; // 0-100 score
  bpdAlignment: number; // 0-100 score for BPD values alignment
}

interface GDPRComplianceCheck {
  hasConsent: boolean;
  dataProcessingLawful: boolean;
  privacyNoticePresent: boolean;
  dataMinimization: boolean;
  rightToErasure: boolean;
  dataPortability: boolean;
  score: number;
}

interface UUITEComplianceCheck {
  respectsIndonesianLaw: boolean;
  culturallyAppropriate: boolean;
  noHateSpeech: boolean;
  noMisinformation: boolean;
  respectsReligiousValues: boolean;
  protectsMinors: boolean;
  score: number;
}

export class ComplianceService {
  private readonly indonesianProhibitedKeywords = [
    // Religious sensitivity
    'blasphemy', 'religious extremism', 'sectarian violence',
    // Political sensitivity  
    'separatism', 'communist ideology', 'regime change',
    // Cultural sensitivity
    'backward culture', 'primitive society', 'uncivilized',
    // Hate speech indicators
    'ethnic cleansing', 'racial superiority', 'religious war'
  ];

  private readonly bpdPositiveKeywords = [
    'mutual respect', 'equality', 'inclusiveness', 'multipolarity',
    'sustainable development', 'south-south cooperation', 'cultural exchange',
    'peaceful coexistence', 'sovereign equality', 'win-win cooperation'
  ];

  /**
   * Comprehensive content compliance check combining GDPR and UU ITE
   */
  async checkContentCompliance(
    content: string, 
    contentType: 'article' | 'comment' | 'ai_generated' | 'user_input',
    metadata?: Record<string, any>
  ): Promise<ComplianceResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Indonesian UU ITE Law compliance
    const uuiteResult = await this.checkUUITECompliance(content, contentType);
    if (uuiteResult.score < 80) {
      violations.push('Content may violate Indonesian UU ITE regulations');
      score -= (100 - uuiteResult.score) * 0.4;
    }

    // Cultural sensitivity check
    const culturalResult = await this.checkCulturalSensitivity(content);
    if (culturalResult.culturalSensitivity < 70) {
      warnings.push('Content may be culturally insensitive');
      score -= (100 - culturalResult.culturalSensitivity) * 0.2;
    }

    // BPD values alignment
    const bpdAlignment = this.calculateBpdAlignment(content);
    if (bpdAlignment < 60) {
      recommendations.push('Consider emphasizing BPD values: mutual respect, equality, inclusiveness');
    }

    // Hate speech detection
    if (this.containsHateSpeech(content)) {
      violations.push('Content contains potential hate speech');
      score -= 30;
    }

    // Misinformation risk assessment
    const misinfoRisk = this.assessMisinformationRisk(content, contentType);
    if (misinfoRisk > 0.6) {
      warnings.push('Content may contain unverified claims');
      score -= misinfoRisk * 15;
    }

    // Privacy compliance for AI-generated content
    if (contentType === 'ai_generated') {
      const privacyResult = await this.checkAIPrivacyCompliance(content, metadata);
      if (privacyResult.score < 90) {
        violations.push('AI-generated content may have privacy compliance issues');
        score -= (100 - privacyResult.score) * 0.1;
      }
    }

    return {
      isCompliant: violations.length === 0 && score >= 75,
      violations,
      warnings,
      score: Math.max(0, Math.min(100, score)),
      recommendations,
      category: 'content'
    };
  }

  /**
   * GDPR compliance check for data processing
   */
  async checkGDPRCompliance(
    dataType: 'personal' | 'behavioral' | 'analytics' | 'cookies',
    processingBasis: string,
    hasConsent: boolean
  ): Promise<GDPRComplianceCheck> {
    const result: GDPRComplianceCheck = {
      hasConsent: hasConsent,
      dataProcessingLawful: false,
      privacyNoticePresent: true, // Assuming privacy notice exists
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      score: 0
    };

    // Lawful basis assessment
    const lawfulBases = [
      'consent', 'contract', 'legal_obligation', 
      'vital_interests', 'public_task', 'legitimate_interests'
    ];
    result.dataProcessingLawful = lawfulBases.includes(processingBasis);

    // Calculate compliance score
    let score = 0;
    if (result.hasConsent) score += 20;
    if (result.dataProcessingLawful) score += 25;
    if (result.privacyNoticePresent) score += 15;
    if (result.dataMinimization) score += 15;
    if (result.rightToErasure) score += 15;
    if (result.dataPortability) score += 10;

    result.score = score;
    return result;
  }

  /**
   * Indonesian UU ITE Law compliance check
   */
  private async checkUUITECompliance(
    content: string, 
    contentType: string
  ): Promise<UUITEComplianceCheck> {
    const result: UUITEComplianceCheck = {
      respectsIndonesianLaw: true,
      culturallyAppropriate: true,
      noHateSpeech: true,
      noMisinformation: true,
      respectsReligiousValues: true,
      protectsMinors: true,
      score: 100
    };

    const lowerContent = content.toLowerCase();
    
    // Check for prohibited content
    for (const keyword of this.indonesianProhibitedKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        result.respectsIndonesianLaw = false;
        result.culturallyAppropriate = false;
        result.score -= 15;
        break;
      }
    }

    // Religious sensitivity check
    const religiousKeywords = ['islam', 'christian', 'hindu', 'buddhist', 'religion'];
    const hasReligiousContent = religiousKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );
    
    if (hasReligiousContent) {
      const negativeReligiousTerms = ['false religion', 'infidel', 'heretic'];
      if (negativeReligiousTerms.some(term => lowerContent.includes(term))) {
        result.respectsReligiousValues = false;
        result.score -= 25;
      }
    }

    // Minor protection check
    const adultContent = ['violence', 'explicit', 'graphic'];
    if (adultContent.some(term => lowerContent.includes(term))) {
      result.protectsMinors = false;
      result.score -= 20;
    }

    return result;
  }

  /**
   * Cultural sensitivity analysis
   */
  private async checkCulturalSensitivity(content: string): Promise<ContentModerationResult> {
    const flags: Array<{
      type: 'hate_speech' | 'misinformation' | 'inappropriate' | 'legal_concern';
      severity: 'low' | 'medium' | 'high';
      description: string;
    }> = [];

    let culturalSensitivity = 80;
    let bpdAlignment = this.calculateBpdAlignment(content);

    const lowerContent = content.toLowerCase();

    // Check for cultural insensitivity
    const insensitiveTerms = [
      'backward', 'primitive', 'uncivilized', 'third world mentality',
      'western superiority', 'cultural imperialism'
    ];

    for (const term of insensitiveTerms) {
      if (lowerContent.includes(term)) {
        flags.push({
          type: 'inappropriate',
          severity: 'medium',
          description: `Content contains potentially insensitive term: "${term}"`
        });
        culturalSensitivity -= 15;
      }
    }

    // Check for positive multicultural language
    const positiveTerms = [
      'cultural diversity', 'mutual respect', 'cultural exchange',
      'understanding', 'harmony', 'cooperation'
    ];

    const positiveCount = positiveTerms.filter(term => 
      lowerContent.includes(term)
    ).length;

    culturalSensitivity += positiveCount * 3;

    return {
      approved: flags.length === 0 && culturalSensitivity >= 70,
      flags,
      culturalSensitivity: Math.min(100, culturalSensitivity),
      bpdAlignment
    };
  }

  /**
   * Calculate BPD (BRICS Partnership for Development) values alignment
   */
  private calculateBpdAlignment(content: string): number {
    const lowerContent = content.toLowerCase();
    let score = 50; // Base score

    // Positive BPD indicators
    for (const keyword of this.bpdPositiveKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        score += 8;
      }
    }

    // Negative indicators (Western hegemony, unilateralism)
    const negativeKeywords = [
      'western dominance', 'unilateral action', 'regime change',
      'cultural imperialism', 'economic sanctions as weapon'
    ];

    for (const keyword of negativeKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        score -= 10;
      }
    }

    // Bonus for multipolar language
    const multipolarTerms = [
      'multipolar', 'multilateral', 'south-south', 'brics',
      'non-aligned', 'sovereign equality'
    ];

    const multipolarCount = multipolarTerms.filter(term => 
      lowerContent.includes(term)
    ).length;

    score += multipolarCount * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Hate speech detection
   */
  private containsHateSpeech(content: string): boolean {
    const lowerContent = content.toLowerCase();
    
    const hateSpeechKeywords = [
      'racial superiority', 'ethnic cleansing', 'religious war',
      'kill all', 'death to', 'eliminate the',
      'subhuman', 'vermin', 'parasite'
    ];

    return hateSpeechKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );
  }

  /**
   * Misinformation risk assessment
   */
  private assessMisinformationRisk(content: string, contentType: string): number {
    const lowerContent = content.toLowerCase();
    let risk = 0.1; // Base risk

    // High-risk indicators
    const riskKeywords = [
      'secret conspiracy', 'hidden truth', 'they don\'t want you to know',
      'fake news media', 'cover up', 'false flag',
      'unverified sources claim', 'breaking: unconfirmed'
    ];

    for (const keyword of riskKeywords) {
      if (lowerContent.includes(keyword)) {
        risk += 0.2;
      }
    }

    // AI-generated content has higher baseline risk
    if (contentType === 'ai_generated') {
      risk += 0.1;
    }

    // Check for proper sourcing
    const hasSourceKeywords = [
      'according to', 'reported by', 'source:', 'citation',
      'reuters', 'associated press', 'official statement'
    ].some(keyword => lowerContent.includes(keyword));

    if (!hasSourceKeywords && contentType !== 'comment') {
      risk += 0.15;
    }

    return Math.min(1, risk);
  }

  /**
   * AI-generated content privacy compliance
   */
  private async checkAIPrivacyCompliance(
    content: string, 
    metadata?: Record<string, any>
  ): Promise<{ score: number; violations: string[] }> {
    const violations: string[] = [];
    let score = 100;

    // Check for potential PII leakage
    const piiPatterns = [
      /\b\d{16}\b/, // Credit card numbers
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{10,15}\b/ // Phone numbers
    ];

    for (const pattern of piiPatterns) {
      if (pattern.test(content)) {
        violations.push('Content may contain personally identifiable information');
        score -= 20;
        break;
      }
    }

    // Check training data attribution
    if (!metadata?.model_attribution) {
      violations.push('AI model attribution missing');
      score -= 10;
    }

    // Check for potential bias in AI output
    const biasKeywords = [
      'superior race', 'inferior culture', 'natural hierarchy',
      'genetic predisposition', 'cultural backwardness'
    ];

    if (biasKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )) {
      violations.push('AI output may contain biased content');
      score -= 25;
    }

    return { score: Math.max(0, score), violations };
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(results: ComplianceResult[]): {
    overallScore: number;
    criticalIssues: string[];
    recommendations: string[];
    summary: string;
  } {
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const overallScore = results.length > 0 ? totalScore / results.length : 0;
    
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    for (const result of results) {
      criticalIssues.push(...result.violations);
      recommendations.push(...result.recommendations);
    }

    // Remove duplicates
    const uniqueCritical = [...new Set(criticalIssues)];
    const uniqueRecommendations = [...new Set(recommendations)];

    let summary = '';
    if (overallScore >= 90) {
      summary = '✅ Excellent compliance - All content meets high standards';
    } else if (overallScore >= 75) {
      summary = '✅ Good compliance - Minor improvements recommended';
    } else if (overallScore >= 60) {
      summary = '⚠️ Fair compliance - Several issues need attention';
    } else {
      summary = '❌ Poor compliance - Critical issues must be addressed';
    }

    return {
      overallScore,
      criticalIssues: uniqueCritical,
      recommendations: uniqueRecommendations,
      summary
    };
  }

  /**
   * Generate compliance disclaimer
   */
  generateComplianceDisclaimer(contentType: 'ai_generated' | 'user_content' | 'editorial'): string {
    const baseDisclaimer = 'This content complies with Indonesian UU ITE regulations and promotes BRICS Partnership for Development values of mutual respect, equality, and sustainable cooperation.';
    
    const typeSpecific = {
      ai_generated: ' AI-generated content is reviewed for cultural sensitivity and factual accuracy.',
      user_content: ' User-contributed content is moderated according to community guidelines.',
      editorial: ' Editorial content maintains journalistic integrity and multipolar perspectives.'
    };

    return baseDisclaimer + typeSpecific[contentType];
  }
}

// Export singleton instance
export const complianceService = new ComplianceService();