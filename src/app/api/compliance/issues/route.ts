import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/compliance-service';
import { advancedCacheService } from '@/lib/advanced-cache-service';

interface ComplianceIssue {
  id: string;
  type: 'violation' | 'warning' | 'recommendation';
  category: 'content' | 'privacy' | 'cultural' | 'legal';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'ignored';
  content?: string;
  resolution?: string;
}

/**
 * GET /api/compliance/issues
 * Returns list of compliance issues
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const severity = searchParams.get('severity') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    const cacheKey = `compliance:issues:${status}:${category}:${severity}:${limit}`;
    
    // Try cache first
    const cached = await advancedCacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Mock compliance issues - in production, fetch from database
    const mockIssues: ComplianceIssue[] = [
      {
        id: 'iss_001',
        type: 'warning',
        category: 'cultural',
        description: 'Content lacks cultural sensitivity markers for Indonesian context',
        severity: 'medium',
        source: 'AI Content Generator',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: 'pending'
      },
      {
        id: 'iss_002',
        type: 'recommendation',
        category: 'content',
        description: 'Consider emphasizing BPD values: mutual respect, equality, inclusiveness',
        severity: 'low',
        source: 'Social Media Module',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: 'pending'
      },
      {
        id: 'iss_003',
        type: 'violation',
        category: 'privacy',
        description: 'AI model attribution missing in generated content',
        severity: 'high',
        source: 'Grok Enhanced Service',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        status: 'resolved',
        resolution: 'Added model attribution to all AI-generated content'
      }
    ];

    // Generate some real issues from sample content analysis
    const problematicContent = [
      {
        content: "This unverified report claims hidden truths about government policies",
        source: "User Comment System"
      },
      {
        content: "Content lacks proper sourcing and verification",
        source: "Article Processor"
      }
    ];

    const realIssues: ComplianceIssue[] = [];
    
    for (const sample of problematicContent) {
      try {
        const result = await complianceService.checkContentCompliance(
          sample.content, 
          'user_input'
        );
        
        // Convert compliance violations to issues
        result.violations.forEach((violation, index) => {
          realIssues.push({
            id: `real_${Date.now()}_${index}`,
            type: 'violation',
            category: 'content',
            description: violation,
            severity: 'high',
            source: sample.source,
            timestamp: new Date().toISOString(),
            status: 'pending',
            content: sample.content.substring(0, 100) + '...'
          });
        });

        result.warnings.forEach((warning, index) => {
          realIssues.push({
            id: `warn_${Date.now()}_${index}`,
            type: 'warning',
            category: 'content',
            description: warning,
            severity: 'medium',
            source: sample.source,
            timestamp: new Date().toISOString(),
            status: 'pending',
            content: sample.content.substring(0, 100) + '...'
          });
        });

        result.recommendations.forEach((recommendation, index) => {
          realIssues.push({
            id: `rec_${Date.now()}_${index}`,
            type: 'recommendation',
            category: 'content',
            description: recommendation,
            severity: 'low',
            source: sample.source,
            timestamp: new Date().toISOString(),
            status: 'pending'
          });
        });
      } catch (error) {
        console.error('Error analyzing sample content:', error);
      }
    }

    // Combine mock and real issues
    let allIssues = [...mockIssues, ...realIssues];

    // Apply filters
    if (status !== 'all') {
      allIssues = allIssues.filter(issue => issue.status === status);
    }
    
    if (category !== 'all') {
      allIssues = allIssues.filter(issue => issue.category === category);
    }
    
    if (severity !== 'all') {
      allIssues = allIssues.filter(issue => issue.severity === severity);
    }

    // Sort by timestamp (newest first) and limit
    allIssues = allIssues
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    // Cache for 2 minutes
    await advancedCacheService.set(
      cacheKey,
      allIssues,
      120,
      ['compliance', 'issues']
    );

    return NextResponse.json(allIssues);

  } catch (error) {
    console.error('Compliance issues error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance issues' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/issues
 * Create new compliance issue or update existing one
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, contentType, source, action } = body;

    if (action === 'check') {
      // Analyze content for compliance issues
      const result = await complianceService.checkContentCompliance(
        content,
        contentType || 'user_input'
      );

      const issues: ComplianceIssue[] = [];
      
      // Convert violations to issues
      result.violations.forEach((violation, index) => {
        issues.push({
          id: `viol_${Date.now()}_${index}`,
          type: 'violation',
          category: 'content',
          description: violation,
          severity: result.score < 50 ? 'critical' : 'high',
          source: source || 'Content Analysis',
          timestamp: new Date().toISOString(),
          status: 'pending',
          content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        });
      });

      result.warnings.forEach((warning, index) => {
        issues.push({
          id: `warn_${Date.now()}_${index}`,
          type: 'warning',
          category: 'content',
          description: warning,
          severity: 'medium',
          source: source || 'Content Analysis',
          timestamp: new Date().toISOString(),
          status: 'pending'
        });
      });

      result.recommendations.forEach((recommendation, index) => {
        issues.push({
          id: `rec_${Date.now()}_${index}`,
          type: 'recommendation',
          category: 'content',
          description: recommendation,
          severity: 'low',
          source: source || 'Content Analysis',
          timestamp: new Date().toISOString(),
          status: 'pending'
        });
      });

      // Clear issues cache to reflect new data
      await advancedCacheService.invalidateByTags(['compliance', 'issues']);

      return NextResponse.json({
        complianceResult: result,
        issues,
        summary: {
          totalIssues: issues.length,
          violations: issues.filter(i => i.type === 'violation').length,
          warnings: issues.filter(i => i.type === 'warning').length,
          recommendations: issues.filter(i => i.type === 'recommendation').length
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Compliance issue creation error:', error);
    return NextResponse.json(
      { error: 'Failed to process compliance check' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/compliance/issues
 * Update issue status or resolution
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, status, resolution } = body;

    if (!issueId || !status) {
      return NextResponse.json(
        { error: 'Issue ID and status are required' },
        { status: 400 }
      );
    }

    // In production, update the database record
    // For now, we'll clear cache to reflect changes
    await advancedCacheService.invalidateByTags(['compliance', 'issues']);

    return NextResponse.json({
      success: true,
      message: `Issue ${issueId} updated to status: ${status}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Compliance issue update error:', error);
    return NextResponse.json(
      { error: 'Failed to update compliance issue' },
      { status: 500 }
    );
  }
}