/**
 * Cache Statistics API Route
 * Provides real-time cache performance metrics
 */

import { NextResponse } from 'next/server';
import { advancedCacheService } from '@/lib/advanced-cache-service';

export async function GET() {
  try {
    const stats = advancedCacheService.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    
    // Return mock stats if service is unavailable
    const mockStats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      totalHits: 0,
      totalMisses: 0,
      averageResponseTime: 0,
      topKeys: [],
      lastCleanup: Date.now(),
      storageBreakdown: {
        memory: 0,
        localStorage: 0
      }
    };
    
    return NextResponse.json({
      success: false,
      error: 'Cache service unavailable',
      stats: mockStats,
      fallback: true
    });
  }
}