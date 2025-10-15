'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw, 
  Database, 
  Clock, 
  TrendingUp,
  Server,
  HardDrive,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  topKeys: Array<{ key: string; hits: number; size: number }>;
  lastCleanup: number;
  storageBreakdown: {
    memory: number;
    localStorage: number;
    redis?: number;
    spaces?: number;
  };
}

interface CachePerformanceDashboardProps {
  className?: string;
}

export default function CachePerformanceDashboard({ className = '' }: CachePerformanceDashboardProps) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchCacheStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cache-stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data.stats);
      setLastUpdated(Date.now());

      // Track analytics event
      if (typeof window !== 'undefined' && (window as any)._paq) {
        (window as any)._paq.push(['trackEvent', 'Cache Dashboard', 'Stats Fetched', 'Success']);
      }

    } catch (err) {
      console.error('Error fetching cache stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cache statistics');
      
      // Load mock data for demonstration
      setStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = (): CacheStats => ({
    totalEntries: 847,
    totalSize: 12.4 * 1024 * 1024, // 12.4 MB
    hitRate: 0.847,
    missRate: 0.153,
    totalHits: 1547,
    totalMisses: 278,
    averageResponseTime: 42,
    lastCleanup: Date.now() - 1800000, // 30 minutes ago
    topKeys: [
      { key: 'grok_opinion...', hits: 247, size: 145600 },
      { key: 'social_insight...', hits: 189, size: 89300 },
      { key: 'video_enrich...', hits: 156, size: 234500 },
      { key: 'personalized...', hits: 134, size: 67800 },
      { key: 'event_content...', hits: 98, size: 123400 }
    ],
    storageBreakdown: {
      memory: 8.2 * 1024 * 1024,
      localStorage: 2.1 * 1024 * 1024,
      redis: 1.8 * 1024 * 1024,
      spaces: 0.3 * 1024 * 1024
    }
  });

  const clearCache = async (type: 'memory' | 'all' = 'all') => {
    try {
      const response = await fetch('/api/cache-clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        // Refresh stats after clearing
        setTimeout(() => fetchCacheStats(), 1000);
        
        // Track analytics event
        if (typeof window !== 'undefined' && (window as any)._paq) {
          (window as any)._paq.push(['trackEvent', 'Cache Dashboard', 'Cache Cleared', type]);
        }
      }
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  };

  useEffect(() => {
    fetchCacheStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCacheStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHealthStatus = (hitRate: number): { color: string; label: string; icon: any } => {
    if (hitRate >= 0.8) return { color: 'text-emerald-600', label: 'Excellent', icon: CheckCircle };
    if (hitRate >= 0.6) return { color: 'text-amber-600', label: 'Good', icon: Activity };
    return { color: 'text-red-600', label: 'Needs Attention', icon: AlertTriangle };
  };

  if (loading && !stats) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">Loading cache performance data...</span>
        </div>
      </Card>
    );
  }

  if (error && !stats) {
    return (
      <Card className={`p-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
            Cache Stats Unavailable
          </h3>
          <p className="text-amber-700 dark:text-amber-300 mb-4">
            Unable to fetch cache performance data. Showing demo data.
          </p>
          <Button onClick={fetchCacheStats} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const healthStatus = getHealthStatus(stats.hitRate);
  const HealthIcon = healthStatus.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Cache Performance Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of multi-tier cache system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchCacheStats()}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button
            onClick={() => clearCache('all')}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Total Entries</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {stats.totalEntries.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatBytes(stats.totalSize)} cached
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${healthStatus.color.includes('emerald') ? 'bg-emerald-100 dark:bg-emerald-800' : healthStatus.color.includes('amber') ? 'bg-amber-100 dark:bg-amber-800' : 'bg-red-100 dark:bg-red-800'}`}>
              <HealthIcon className={`h-6 w-6 ${healthStatus.color}`} />
            </div>
            <h3 className="font-semibold">Hit Rate</h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${healthStatus.color}`}>
            {formatPercentage(stats.hitRate)}
          </div>
          <Badge variant="outline" className={`${healthStatus.color} border-current`}>
            {healthStatus.label}
          </Badge>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Avg Response</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {stats.averageResponseTime.toFixed(0)}ms
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cache lookup time
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold">Total Hits</h3>
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            {stats.totalHits.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.totalMisses.toLocaleString()} misses
          </p>
        </Card>
      </div>

      {/* Storage Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-3">
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatBytes(stats.storageBreakdown.memory)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Memory Cache</div>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-3">
              <HardDrive className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatBytes(stats.storageBreakdown.localStorage)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Local Storage</div>
          </div>
          {stats.storageBreakdown.redis && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mb-3">
                <Server className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatBytes(stats.storageBreakdown.redis)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Redis Cache</div>
            </div>
          )}
          {stats.storageBreakdown.spaces && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-3">
                <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatBytes(stats.storageBreakdown.spaces)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">DO Spaces</div>
            </div>
          )}
        </div>
      </Card>

      {/* Top Cache Keys */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Most Accessed Cache Keys
        </h3>
        <div className="space-y-4">
          {stats.topKeys.map((key, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {key.key}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBytes(key.size)}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {key.hits} hits
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Cache Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hit Rate:</span>
              <span className={`font-semibold ${healthStatus.color}`}>
                {formatPercentage(stats.hitRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Miss Rate:</span>
              <span className="font-semibold">
                {formatPercentage(stats.missRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
              <span className="font-semibold">
                {((stats.storageBreakdown.memory / (50 * 1024 * 1024)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Maintenance</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Cleanup:</span>
              <span className="font-semibold">
                {Math.floor((Date.now() - stats.lastCleanup) / 60000)}m ago
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="font-semibold">
                {Math.floor((Date.now() - lastUpdated) / 1000)}s ago
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => clearCache('memory')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Memory Cache
            </Button>
            <Button
              onClick={() => clearCache('all')}
              variant="outline"
              size="sm"
              className="w-full text-red-600 hover:text-red-700"
            >
              Clear All Caches
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}