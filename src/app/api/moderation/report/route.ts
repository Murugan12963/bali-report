import { NextRequest, NextResponse } from 'next/server';
import { userContentModerationService, UserReport } from '@/lib/user-content-moderation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reporterId, contentType, contentId, reason, description } = body;

    // Validate required fields
    if (!reporterId || !contentType || !contentId || !reason || !description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: reporterId, contentType, contentId, reason, description' 
        },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = ['article', 'vote', 'comment', 'user'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid contentType. Must be one of: ${validContentTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = ['spam', 'inappropriate', 'misinformation', 'harassment', 'vote_manipulation', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid reason. Must be one of: ${validReasons.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Description must be at least 10 characters long' 
        },
        { status: 400 }
      );
    }

    // Submit the report
    const report = await userContentModerationService.submitReport(
      reporterId,
      contentType,
      contentId,
      reason,
      description.trim()
    );

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        status: report.status,
        timestamp: report.timestamp
      }
    });

  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while submitting report' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // For now, just return pending reports (in production, this would need admin auth)
    const reports = userContentModerationService.getPendingReports();
    
    // Filter by status if provided
    const filteredReports = status === 'pending' 
      ? reports 
      : reports; // In full implementation, would filter by status

    return NextResponse.json({
      success: true,
      reports: filteredReports.map(report => ({
        id: report.id,
        contentType: report.contentType,
        contentId: report.contentId,
        reason: report.reason,
        description: report.description,
        timestamp: report.timestamp,
        status: report.status
      }))
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while fetching reports' 
      },
      { status: 500 }
    );
  }
}