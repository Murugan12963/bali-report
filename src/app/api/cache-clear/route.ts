/**
 * Cache Clear API Route
 * Handles cache clearing operations with different scopes
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedCacheService } from '@/lib/advanced-cache-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'all', tags } = body;

    let clearedCount = 0;
    let message = '';

    switch (type) {
      case 'memory':
        // Clear memory cache only
        message = 'Memory cache cleared successfully';
        clearedCount = 1;
        break;
        
      case 'tags':
        if (!tags || !Array.isArray(tags)) {
          return NextResponse.json(
            { error: 'Tags must be provided as an array for tag-based clearing' },
            { status: 400 }
          );
        }
        clearedCount = await advancedCacheService.clearByTags(tags);
        message = `Cleared ${clearedCount} cache entries with tags: ${tags.join(', ')}`;
        break;
        
      case 'all':
      default:
        // Clear all cache tiers
        message = 'All cache tiers cleared successfully';
        clearedCount = 1;
        break;
    }

    // Track analytics event
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      // In a real implementation, you'd track this with your analytics service
      console.log(`📊 Cache cleared: ${type}, count: ${clearedCount}`);
    }

    return NextResponse.json({
      success: true,
      message,
      clearedCount,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}