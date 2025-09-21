/**
 * Health Check API Endpoint
 * Provides system health status for monitoring services
 */

import { NextRequest, NextResponse } from 'next/server';
import { rssAggregator } from '@/lib/rss-parser';
import { rssCache } from '@/lib/rss-cache';
import { saveForLaterService } from '@/lib/save-for-later';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    rss: {
      status: 'ok' | 'error';
      activeSources: number;
      cachedSources: number;
      cacheHitRate: number;
      lastFetch?: string;
    };
    cache: {
      status: 'ok' | 'error';
      size: number;
      hitRate: number;
      totalRequests: number;
    };
    storage: {
      status: 'ok' | 'error';
      savedArticles?: number;
      storageAvailable: boolean;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
  };
  version: string;
  environment: string;
}

// Track application start time
const startTime = Date.now();

export async function GET(request: NextRequest) {
  try {
    // Calculate uptime
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    // Get cache statistics
    const cacheStats = rssCache.getStats();
    const cacheHitRate = rssCache.getHitRate();

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Determine memory status
    const memoryStatus = heapUsedPercent > 90 ? 'critical' : 
                        heapUsedPercent > 70 ? 'warning' : 'ok';

    // Check storage availability
    let storageAvailable = false;
    let savedArticlesCount = 0;
    
    try {
      if (typeof window !== 'undefined') {
        storageAvailable = true;
        savedArticlesCount = saveForLaterService.getSavedArticles().length;
      }
    } catch (error) {
      console.error('Storage check failed:', error);
    }

    // Build health status response
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      checks: {
        rss: {
          status: 'ok',
          activeSources: rssAggregator.getActiveSources().length,
          cachedSources: cacheStats.cachedSources,
          cacheHitRate,
        },
        cache: {
          status: 'ok',
          size: cacheStats.cacheSize,
          hitRate: cacheHitRate,
          totalRequests: cacheStats.totalRequests,
        },
        storage: {
          status: storageAvailable ? 'ok' : 'error',
          savedArticles: savedArticlesCount,
          storageAvailable,
        },
        memory: {
          status: memoryStatus,
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        },
      },
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Determine overall health status
    if (memoryStatus === 'critical' || !storageAvailable) {
      healthStatus.status = 'unhealthy';
    } else if (memoryStatus === 'warning' || cacheHitRate < 30) {
      healthStatus.status = 'degraded';
    }

    // Return appropriate status code based on health
    const statusCode = healthStatus.status === 'healthy' ? 200 :
                       healthStatus.status === 'degraded' ? 206 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {},
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    }, { status: 503 });
  }
}

// Simple liveness check
export async function HEAD() {
  return new Response(null, { status: 200 });
}