import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/compliance-service';
import { advancedCacheService } from '@/lib/advanced-cache-service';

/**
 * POST /api/compliance/export
 * Export compliance report in various formats
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      format = 'json', 
      includeStats = true, 
      includeIssues = true,
      dateRange,
      categories 
    } = body;

    const cacheKey = `compliance:export:${format}:${JSON.stringify(body)}`;
    
    // Check cache for non-PDF exports
    if (format !== 'pdf') {
      const cached = await advancedCacheService.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: {
            'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
            'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.${format}"`
          }
        });
      }
    }

    // Fetch compliance data
    const [statsResponse, issuesResponse] = await Promise.all([
      fetch(new URL('/api/compliance/stats', request.url).toString()),
      fetch(new URL('/api/compliance/issues?limit=100', request.url).toString())
    ]);

    const stats = statsResponse.ok ? await statsResponse.json() : null;
    const issues = issuesResponse.ok ? await issuesResponse.json() : [];

    // Generate compliance summary
    const reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportPeriod: dateRange || 'Current',
        version: '1.0.0',
        compliance: {
          gdpr: 'European General Data Protection Regulation',
          uuIte: 'Indonesian Law No. 11 of 2008 on Electronic Information and Transactions',
          bpd: 'BRICS Partnership for Development Values'
        }
      },
      executive_summary: {
        overallScore: stats?.overallScore || 0,
        totalChecks: stats?.contentChecks || 0,
        criticalIssues: stats?.criticalIssues || 0,
        warnings: stats?.warnings || 0,
        status: stats?.overallScore >= 90 ? 'Excellent' :
                stats?.overallScore >= 75 ? 'Good' :
                stats?.overallScore >= 60 ? 'Fair' : 'Needs Improvement'
      },
      compliance_scores: includeStats ? {
        gdpr_compliance: stats?.gdprCompliance || 0,
        uu_ite_compliance: stats?.uuiteCompliance || 0,
        cultural_sensitivity: stats?.categories?.cultural?.score || 0,
        bpd_alignment: ((stats?.categories?.content?.score || 0) + (stats?.categories?.cultural?.score || 0)) / 2
      } : null,
      daily_statistics: includeStats ? stats?.dailyStats : null,
      category_breakdown: includeStats ? stats?.categories : null,
      issues: includeIssues ? issues.map((issue: any) => ({
        id: issue.id,
        type: issue.type,
        category: issue.category,
        description: issue.description,
        severity: issue.severity,
        source: issue.source,
        timestamp: issue.timestamp,
        status: issue.status,
        resolution: issue.resolution
      })) : null,
      recommendations: [
        'Implement regular compliance monitoring and reporting',
        'Enhance cultural sensitivity training for content creators',
        'Strengthen BPD values integration in AI-generated content',
        'Establish clear GDPR data processing procedures',
        'Maintain Indonesian UU ITE regulation compliance standards'
      ],
      legal_disclaimers: {
        gdpr: 'This report assists with GDPR compliance but does not constitute legal advice. Consult legal counsel for specific requirements.',
        uu_ite: 'Compliance with Indonesian UU ITE regulations requires ongoing monitoring and adaptation to regulatory changes.',
        bpd: 'BPD values alignment promotes multipolar cooperation and cultural sensitivity in content creation.',
        ai_content: 'AI-generated content is subject to additional review and attribution requirements.'
      }
    };

    if (format === 'json') {
      const jsonContent = JSON.stringify(reportData, null, 2);
      
      // Cache JSON reports for 10 minutes
      await advancedCacheService.set(cacheKey, jsonContent, 600, ['compliance', 'export']);
      
      return new Response(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

    if (format === 'csv') {
      const csvContent = generateCSVReport(reportData);
      
      // Cache CSV reports for 10 minutes
      await advancedCacheService.set(cacheKey, csvContent, 600, ['compliance', 'export']);
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (format === 'pdf') {
      const pdfContent = generatePDFReport(reportData);
      
      return new Response(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Unsupported export format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Compliance export error:', error);
    return NextResponse.json(
      { error: 'Failed to export compliance report' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV format report
 */
function generateCSVReport(data: any): string {
  const lines: string[] = [];
  
  // Header
  lines.push('BALI REPORT - COMPLIANCE REPORT');
  lines.push(`Generated: ${data.metadata.generatedAt}`);
  lines.push('');
  
  // Executive Summary
  lines.push('EXECUTIVE SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Overall Compliance Score,${data.executive_summary.overallScore}%`);
  lines.push(`Total Content Checks,${data.executive_summary.totalChecks}`);
  lines.push(`Critical Issues,${data.executive_summary.criticalIssues}`);
  lines.push(`Warnings,${data.executive_summary.warnings}`);
  lines.push(`Status,${data.executive_summary.status}`);
  lines.push('');
  
  // Compliance Scores
  if (data.compliance_scores) {
    lines.push('COMPLIANCE SCORES');
    lines.push('Category,Score');
    lines.push(`GDPR Compliance,${data.compliance_scores.gdpr_compliance}%`);
    lines.push(`UU ITE Compliance,${data.compliance_scores.uu_ite_compliance}%`);
    lines.push(`Cultural Sensitivity,${data.compliance_scores.cultural_sensitivity}%`);
    lines.push(`BPD Alignment,${data.compliance_scores.bpd_alignment}%`);
    lines.push('');
  }
  
  // Issues
  if (data.issues && data.issues.length > 0) {
    lines.push('COMPLIANCE ISSUES');
    lines.push('ID,Type,Category,Severity,Description,Source,Status,Timestamp');
    
    data.issues.forEach((issue: any) => {
      const description = issue.description.replace(/"/g, '""').replace(/,/g, ';');
      lines.push(`${issue.id},${issue.type},${issue.category},${issue.severity},"${description}",${issue.source},${issue.status},${issue.timestamp}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Generate PDF format report (simplified - in production use proper PDF library)
 */
function generatePDFReport(data: any): string {
  // In production, use libraries like jsPDF, PDFKit, or Puppeteer
  // For now, return a simple text-based PDF placeholder
  const content = `
BALI REPORT - COMPLIANCE REPORT
Generated: ${data.metadata.generatedAt}

EXECUTIVE SUMMARY
Overall Compliance Score: ${data.executive_summary.overallScore}%
Status: ${data.executive_summary.status}
Total Content Checks: ${data.executive_summary.totalChecks}
Critical Issues: ${data.executive_summary.criticalIssues}
Warnings: ${data.executive_summary.warnings}

COMPLIANCE FRAMEWORK
- GDPR (General Data Protection Regulation)
- Indonesian UU ITE Law No. 11 of 2008
- BRICS Partnership for Development Values

SCORES
GDPR Compliance: ${data.compliance_scores?.gdpr_compliance || 0}%
UU ITE Compliance: ${data.compliance_scores?.uu_ite_compliance || 0}%
Cultural Sensitivity: ${data.compliance_scores?.cultural_sensitivity || 0}%
BPD Values Alignment: ${data.compliance_scores?.bpd_alignment || 0}%

RECOMMENDATIONS
${data.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

LEGAL DISCLAIMERS
This automated compliance report is for informational purposes and does not constitute legal advice.
Consult qualified legal counsel for specific compliance requirements.
`;
  
  return content;
}