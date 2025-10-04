import { NextRequest, NextResponse } from 'next/server';
import { NewsletterAutomation, DEFAULT_SCHEDULES, type NewsletterSchedule } from '@/lib/newsletter-automation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Newsletter automation API endpoint.
 * Handles automated newsletter generation and sending.
 * 
 * POST /api/newsletter/run
 * 
 * Body:
 *   scheduleId (string): Specific schedule to run (optional).
 *   type (string): Newsletter type to run (daily/weekly/monthly).
 *   preview (boolean): Generate preview without sending (optional).
 *   
 * Headers:
 *   Authorization: Bearer TOKEN (for security).
 */
export async function POST(request: NextRequest) {
  // Rate limiting - allow 5 requests per minute
  const clientIp = getClientIp(request.headers);
  const rateLimitResult = rateLimit(clientIp, {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5 // 5 requests per minute
  });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        error: 'Rate limit exceeded'
      },
      { status: 429 }
    );
  }

  // Simple auth check - use a bearer token for automation security
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.NEWSLETTER_AUTOMATION_TOKEN;
  
  if (!expectedToken) {
    console.warn('🚨 NEWSLETTER_AUTOMATION_TOKEN not configured');
    return NextResponse.json(
      {
        success: false,
        message: 'Newsletter automation not configured',
        error: 'Missing automation token'
      },
      { status: 500 }
    );
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== expectedToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized access',
        error: 'Invalid authentication'
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { scheduleId, type, preview = false } = body;

    console.log('🤖 Newsletter automation triggered:', { scheduleId, type, preview });

    // Initialize automation service
    const automation = new NewsletterAutomation();
    
    // Determine which schedule to run
    let schedulesToRun: NewsletterSchedule[] = [];
    
    if (scheduleId) {
      // Run specific schedule
      const schedule = DEFAULT_SCHEDULES.find(s => s.id === scheduleId);
      if (!schedule) {
        return NextResponse.json(
          {
            success: false,
            message: `Schedule '${scheduleId}' not found`,
            error: 'Schedule not found'
          },
          { status: 404 }
        );
      }
      
      if (!schedule.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: `Schedule '${scheduleId}' is inactive`,
            error: 'Schedule inactive'
          },
          { status: 400 }
        );
      }
      
      schedulesToRun = [schedule];
    } else if (type) {
      // Run all schedules of specific type
      schedulesToRun = DEFAULT_SCHEDULES.filter(s => s.type === type && s.isActive);
    } else {
      // Check which schedules should run now based on time/frequency
      schedulesToRun = await determineSchedulesToRun();
    }

    if (schedulesToRun.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No schedules to run at this time',
          schedulesRun: 0
        }
      );
    }

    const results = [];
    
    // Process each schedule
    for (const schedule of schedulesToRun) {
      try {
        console.log(`📧 Processing schedule: ${schedule.name}`);
        
        // Generate newsletter content
        const content = await automation.generateNewsletterContent(schedule);
        
        if (preview) {
          // Preview mode - just return the content
          results.push({
            scheduleId: schedule.id,
            scheduleName: schedule.name,
            success: true,
            preview: {
              subject: content.subject,
              preheader: content.preheader,
              sectionsCount: content.sections.length,
              articlesCount: content.sections.reduce((acc, section) => 
                acc + (section.articles?.length || 0), 0
              )
            }
          });
        } else {
          // Send the newsletter
          const campaignResult = await automation.createAndSendCampaign(
            content, 
            schedule.segmentIds
          );
          
          results.push({
            scheduleId: schedule.id,
            scheduleName: schedule.name,
            success: campaignResult.success,
            campaignId: campaignResult.campaignId,
            error: campaignResult.error,
            articlesCount: content.sections.reduce((acc, section) => 
              acc + (section.articles?.length || 0), 0
            ),
            subject: content.subject
          });
        }
        
      } catch (error: any) {
        console.error(`🚨 Error processing schedule ${schedule.id}:`, error);
        results.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalArticles = results.reduce((acc, r) => acc + (r.articlesCount || 0), 0);

    console.log(`✅ Newsletter automation completed: ${successCount}/${results.length} schedules successful`);

    return NextResponse.json({
      success: successCount > 0,
      message: preview 
        ? `Generated ${successCount} newsletter previews`
        : `Sent ${successCount} newsletters with ${totalArticles} articles total`,
      schedulesRun: results.length,
      successfulRuns: successCount,
      results,
      preview
    });

  } catch (error: any) {
    console.error('🚨 Newsletter automation API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to run newsletter automation',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get newsletter automation status and schedules.
 * 
 * GET /api/newsletter/run
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request.headers);
  const rateLimitResult = rateLimit(clientIp, {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10 // 10 requests per minute
  });
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    // Get schedule status
    const schedules = DEFAULT_SCHEDULES.map(schedule => ({
      id: schedule.id,
      name: schedule.name,
      type: schedule.type,
      frequency: schedule.frequency,
      time: schedule.time,
      isActive: schedule.isActive,
      lastSent: schedule.lastSent,
      nextSend: schedule.nextSend,
      contentFilters: {
        categoriesCount: schedule.contentFilters.categories?.length || 0,
        sourcesCount: schedule.contentFilters.sources?.length || 0,
        keywordsCount: schedule.contentFilters.keywords?.length || 0,
        maxArticles: schedule.contentFilters.maxArticles,
        minRelevanceScore: schedule.contentFilters.minRelevanceScore
      }
    }));

    const response: any = {
      success: true,
      message: 'Newsletter automation status',
      schedules,
      totalSchedules: schedules.length,
      activeSchedules: schedules.filter(s => s.isActive).length,
      configured: {
        mailchimp: !!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_AUDIENCE_ID),
        automation: !!process.env.NEWSLETTER_AUTOMATION_TOKEN
      }
    };

    if (includeStats) {
      // Add basic stats (you might want to store this data in a database)
      response.stats = {
        lastRun: null, // Would be stored in database
        totalSent: 0,   // Would be tracked in database
        avgOpenRate: 0, // Would be calculated from campaign stats
        avgClickRate: 0 // Would be calculated from campaign stats
      };
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('🚨 Newsletter status API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get newsletter status',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Determine which schedules should run based on current time and frequency.
 * This is a simplified version - in production, you'd want more sophisticated scheduling.
 */
async function determineSchedulesToRun(): Promise<NewsletterSchedule[]> {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentMinute = now.getMinutes();
  
  const schedulesToRun: NewsletterSchedule[] = [];
  
  for (const schedule of DEFAULT_SCHEDULES) {
    if (!schedule.isActive) continue;
    
    let shouldRun = false;
    
    // Check if schedule should run based on type and frequency
    switch (schedule.type) {
      case 'daily':
        // For daily schedules, check if it's the right time
        if (schedule.time) {
          const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
          // Run if we're within 5 minutes of the scheduled time
          if (currentHour === scheduleHour && Math.abs(currentMinute - scheduleMinute) <= 5) {
            shouldRun = true;
          }
        } else {
          // Default daily run times based on frequency
          if (schedule.frequency === 'morning' && currentHour === 8 && currentMinute <= 5) {
            shouldRun = true;
          } else if (schedule.frequency === 'evening' && currentHour === 18 && currentMinute <= 5) {
            shouldRun = true;
          }
        }
        break;
        
      case 'weekly':
        // For weekly schedules, check day and time
        if (schedule.frequency === 'monday' && currentDay === 1) {
          const [scheduleHour] = (schedule.time || '12:00').split(':').map(Number);
          if (currentHour === scheduleHour && currentMinute <= 5) {
            shouldRun = true;
          }
        } else if (schedule.frequency === 'friday' && currentDay === 5) {
          const [scheduleHour] = (schedule.time || '17:00').split(':').map(Number);
          if (currentHour === scheduleHour && currentMinute <= 5) {
            shouldRun = true;
          }
        }
        break;
        
      case 'monthly':
        // For monthly schedules, check if it's the first day of the month
        if (now.getDate() === 1) {
          const [scheduleHour] = (schedule.time || '10:00').split(':').map(Number);
          if (currentHour === scheduleHour && currentMinute <= 5) {
            shouldRun = true;
          }
        }
        break;
    }
    
    if (shouldRun) {
      // Additional check to prevent duplicate sends (in production, store last sent time in database)
      // For now, we'll rely on the calling system to handle this
      schedulesToRun.push(schedule);
    }
  }
  
  return schedulesToRun;
}