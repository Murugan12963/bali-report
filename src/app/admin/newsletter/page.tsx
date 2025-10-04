'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Calendar, 
  Settings, 
  Play,
  Eye,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  frequency?: string;
  time?: string;
  isActive: boolean;
  lastSent?: string;
  nextSend?: string;
  contentFilters: {
    categoriesCount: number;
    sourcesCount: number;
    keywordsCount: number;
    maxArticles?: number;
    minRelevanceScore?: number;
  };
}

interface NewsletterStatus {
  success: boolean;
  schedules: Schedule[];
  totalSchedules: number;
  activeSchedules: number;
  configured: {
    mailchimp: boolean;
    automation: boolean;
  };
}

interface RunResult {
  scheduleId: string;
  scheduleName: string;
  success: boolean;
  campaignId?: string;
  error?: string;
  articlesCount?: number;
  subject?: string;
  preview?: {
    subject: string;
    preheader: string;
    sectionsCount: number;
    articlesCount: number;
  };
}

/**
 * Newsletter administration dashboard.
 * Allows management of automated newsletter schedules and manual sending.
 */
export default function NewsletterAdminPage() {
  const [status, setStatus] = useState<NewsletterStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningSchedules, setRunningSchedules] = useState<Set<string>>(new Set());
  const [recentResults, setRecentResults] = useState<RunResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load newsletter automation status.
   */
  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/newsletter/run?stats=true');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      } else {
        setError(data.message || 'Failed to load newsletter status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error loading status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Run newsletter automation for specific schedule or type.
   */
  const runNewsletter = async (scheduleId?: string, type?: string, preview: boolean = false) => {
    try {
      if (scheduleId) {
        setRunningSchedules(prev => new Set([...prev, scheduleId]));
      }
      
      const body = {
        ...(scheduleId && { scheduleId }),
        ...(type && { type }),
        preview
      };

      const response = await fetch('/api/newsletter/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NEWSLETTER_AUTOMATION_TOKEN || 'demo-token'}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      if (result.success) {
        setRecentResults(prev => [...result.results, ...prev].slice(0, 10));
        await loadStatus(); // Refresh status
      } else {
        setError(result.message || 'Failed to run newsletter');
      }
    } catch (err: any) {
      setError(err.message || 'Network error running newsletter');
    } finally {
      if (scheduleId) {
        setRunningSchedules(prev => {
          const newSet = new Set(prev);
          newSet.delete(scheduleId);
          return newSet;
        });
      }
    }
  };

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
            <span className="ml-2 text-lg text-zinc-600 dark:text-zinc-400">Loading newsletter status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Newsletter Automation
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage automated newsletter schedules and send newsletters manually.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 dark:text-red-200 font-medium">Error</span>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}

        {/* Configuration Status */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.configured.mailchimp ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Mailchimp</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {status.configured.mailchimp ? 'Connected' : 'Not configured'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status.configured.automation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Automation</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {status.configured.automation ? 'Token configured' : 'Token missing'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Total Schedules</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {status.totalSchedules}
              </p>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Active Schedules</span>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {status.activeSchedules}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Newsletter Schedules */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Newsletter Schedules
                </h2>
                <button
                  onClick={loadStatus}
                  className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {status?.schedules.length ? (
                <div className="space-y-4">
                  {status.schedules.map((schedule) => (
                    <div key={schedule.id} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {schedule.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              schedule.type === 'daily' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                              schedule.type === 'weekly' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {schedule.type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              schedule.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {schedule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => runNewsletter(schedule.id, undefined, true)}
                            disabled={runningSchedules.has(schedule.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Preview newsletter"
                          >
                            {runningSchedules.has(schedule.id) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => runNewsletter(schedule.id)}
                            disabled={runningSchedules.has(schedule.id) || !schedule.isActive}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Send newsletter now"
                          >
                            {runningSchedules.has(schedule.id) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <div>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.frequency} {schedule.time && `at ${schedule.time}`}
                          </span>
                        </div>
                        <div>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {schedule.contentFilters.maxArticles || 20} articles max
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No newsletter schedules configured</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Manual Actions */}
          <div className="space-y-6">
            {/* Manual Actions */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Manual Actions
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <button
                  onClick={() => runNewsletter(undefined, 'daily', true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview Daily Newsletter
                </button>
                
                <button
                  onClick={() => runNewsletter(undefined, 'daily')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Send Daily Newsletter
                </button>
                
                <button
                  onClick={() => runNewsletter(undefined, 'weekly')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Send Weekly Roundup
                </button>
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Activity
                </h2>
              </div>
              
              <div className="p-6">
                {recentResults.length ? (
                  <div className="space-y-3">
                    {recentResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {result.scheduleName}
                          </p>
                          
                          {result.success && result.preview ? (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Preview generated: {result.preview.articlesCount} articles, {result.preview.sectionsCount} sections
                            </p>
                          ) : result.success ? (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Sent: {result.articlesCount} articles
                              {result.campaignId && ` (Campaign: ${result.campaignId})`}
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Error: {result.error}
                            </p>
                          )}
                          
                          {result.subject && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 truncate">
                              "{result.subject}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent newsletter activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}