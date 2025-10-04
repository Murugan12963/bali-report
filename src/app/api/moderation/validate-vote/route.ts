import { NextRequest, NextResponse } from 'next/server';
import { userContentModerationService } from '@/lib/user-content-moderation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, articleId, voteType } = body;

    // Validate required fields
    if (!userId || !articleId || !voteType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userId, articleId, voteType' 
        },
        { status: 400 }
      );
    }

    // Validate vote type
    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid voteType. Must be "up" or "down"' 
        },
        { status: 400 }
      );
    }

    // Get client IP and User-Agent for tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate the vote through moderation service
    const validation = await userContentModerationService.validateVote(
      userId,
      articleId,
      voteType,
      ipAddress,
      userAgent
    );

    if (!validation.allowed) {
      return NextResponse.json(
        {
          success: false,
          allowed: false,
          error: validation.reason,
          confidence: validation.confidence
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Vote is allowed
    return NextResponse.json({
      success: true,
      allowed: true,
      message: 'Vote validated successfully',
      confidence: validation.confidence
    });

  } catch (error) {
    console.error('Error validating vote:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while validating vote' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check user's voting status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing userId parameter' 
        },
        { status: 400 }
      );
    }

    // Analyze suspicious activity for this user
    const suspiciousActivities = await userContentModerationService.analyzeSuspiciousActivity(userId);
    
    // Get moderation stats
    const stats = userContentModerationService.getModerationStats();

    return NextResponse.json({
      success: true,
      userId,
      suspiciousActivities: suspiciousActivities.map(activity => ({
        type: activity.activityType,
        severity: activity.severity,
        description: activity.description,
        confidence: activity.confidence,
        timestamp: activity.timestamp
      })),
      moderationStats: {
        totalReports: stats.totalReports,
        suspiciousUsers: stats.suspiciousUsers,
        voteManipulationDetected: stats.voteManipulationDetected
      }
    });

  } catch (error) {
    console.error('Error getting vote status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while getting vote status' 
      },
      { status: 500 }
    );
  }
}