'use client';

import React, { useState, useEffect } from 'react';
import { 
  contentModerationService, 
  ContentQualityMetrics, 
  ModerationResult 
} from '@/lib/content-moderation';
import { 
  userContentModerationService, 
  UserReport, 
  UserModerationStats,
  SuspiciousActivity
} from '@/lib/user-content-moderation';

interface ModerationDashboardProps {}

const ModerationDashboard: React.FC<ModerationDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'quality' | 'suspicious' | 'settings'>('reports');
  const [pendingReports, setPendingReports] = useState<UserReport[]>([]);
  const [moderationStats, setModerationStats] = useState<UserModerationStats | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<ContentQualityMetrics | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      // Load user reports and stats
      const reports = userContentModerationService.getPendingReports();
      const stats = userContentModerationService.getModerationStats();
      const quality = contentModerationService.getQualityMetrics();

      setPendingReports(reports);
      setModerationStats(stats);
      setQualityMetrics(quality);

      // Load suspicious activities for recent users (demo data)
      const mockSuspiciousActivities: SuspiciousActivity[] = [
        {
          userId: 'user_123',
          activityType: 'rapid_voting',
          severity: 'high',
          description: '15 votes within 2-second intervals',
          confidence: 0.9,
          evidence: { rapidVoteCount: 15, totalVotes: 45 },
          timestamp: new Date().toISOString()
        }
      ];
      setSuspiciousActivities(mockSuspiciousActivities);

    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (
    reportId: string, 
    action: 'dismiss' | 'warn' | 'suspend' | 'ban',
    notes: string
  ) => {
    try {
      await userContentModerationService.reviewReport(reportId, 'admin', action, notes);
      await loadModerationData(); // Refresh data
    } catch (error) {
      console.error('Failed to review report:', error);
      alert('Failed to review report. Please try again.');
    }
  };

  const handleSubmitTestReport = async () => {
    try {
      await userContentModerationService.submitReport(
        'test_user',
        'article',
        'article_123',
        'spam',
        'Test report for demonstration purposes'
      );
      await loadModerationData();
    } catch (error) {
      console.error('Failed to submit test report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading moderation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🛡️ Content Moderation Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor content quality, review user reports, and manage community standards.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moderationStats?.pendingReports || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moderationStats?.suspiciousUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actions This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moderationStats?.actionsThisWeek || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {qualityMetrics ? 
                    Math.round((qualityMetrics.approvedArticles / Math.max(qualityMetrics.totalArticlesProcessed, 1)) * 100) : 
                    95}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-zinc-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'reports', label: 'User Reports', icon: '📋' },
              { key: 'quality', label: 'Content Quality', icon: '📊' },
              { key: 'suspicious', label: 'Suspicious Activity', icon: '🚨' },
              { key: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === tab.key
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'reports' && (
            <UserReportsTab 
              reports={pendingReports}
              onReviewReport={handleReviewReport}
              onSubmitTestReport={handleSubmitTestReport}
            />
          )}

          {activeTab === 'quality' && (
            <ContentQualityTab metrics={qualityMetrics} />
          )}

          {activeTab === 'suspicious' && (
            <SuspiciousActivityTab activities={suspiciousActivities} />
          )}

          {activeTab === 'settings' && (
            <ModerationSettingsTab />
          )}
        </div>
      </div>
    </div>
  );
};

// User Reports Tab Component
const UserReportsTab: React.FC<{
  reports: UserReport[];
  onReviewReport: (reportId: string, action: 'dismiss' | 'warn' | 'suspend' | 'ban', notes: string) => void;
  onSubmitTestReport: () => void;
}> = ({ reports, onReviewReport, onSubmitTestReport }) => {
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const handleReview = (action: 'dismiss' | 'warn' | 'suspend' | 'ban') => {
    if (!selectedReport) return;
    
    onReviewReport(selectedReport.id, action, reviewNotes);
    setSelectedReport(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Test Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Pending User Reports ({reports.length})
        </h2>
        <button
          onClick={onSubmitTestReport}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          + Submit Test Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
          <span className="text-6xl mb-4 block">✅</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Pending Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All user reports have been reviewed. Great job keeping the community safe!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`
                  p-4 bg-white dark:bg-zinc-800 rounded-lg border cursor-pointer transition-all
                  ${selectedReport?.id === report.id 
                    ? 'border-teal-500 ring-2 ring-teal-200 dark:ring-teal-800' 
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                  }
                `}
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${report.reason === 'spam' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      report.reason === 'inappropriate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      report.reason === 'vote_manipulation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}>
                    {report.reason.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(report.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                  {report.contentType} - {report.contentId}
                </p>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {report.description}
                </p>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Reported by: {report.reporterId}
                </div>
              </div>
            ))}
          </div>

          {/* Report Detail Panel */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-6">
            {selectedReport ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Report Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedReport.contentType}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedReport.reason.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-700 p-3 rounded">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-zinc-700 dark:text-white"
                    rows={3}
                    placeholder="Add review notes..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReview('dismiss')}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleReview('warn')}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Warn
                  </button>
                  <button
                    onClick={() => handleReview('suspend')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleReview('ban')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Ban
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a report to review details and take action
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Content Quality Tab Component
const ContentQualityTab: React.FC<{ metrics: ContentQualityMetrics | null }> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Content Quality Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📊 Processing Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Processed:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {metrics?.totalArticlesProcessed || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Approved:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {metrics?.approvedArticles || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Rejected:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {metrics?.rejectedArticles || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            🔄 Quality Issues
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Duplicates Removed:</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {metrics?.duplicatesRemoved || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Quality Issues:</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {metrics?.qualityIssues || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Source Updates:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {metrics?.sourceReliabilityUpdates || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            ✅ Quality Score
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {metrics ? 
                Math.round((metrics.approvedArticles / Math.max(metrics.totalArticlesProcessed, 1)) * 100) : 
                95}%
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Articles meeting quality standards
            </p>
          </div>
        </div>
      </div>

      {/* Additional Quality Details */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          📈 Quality Trends
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Quality trend charts would go here in a full implementation
          <br />
          <small>(Requires database integration for historical data)</small>
        </div>
      </div>
    </div>
  );
};

// Suspicious Activity Tab Component  
const SuspiciousActivityTab: React.FC<{ activities: SuspiciousActivity[] }> = ({ activities }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Suspicious Activity Monitor
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
          <span className="text-6xl mb-4 block">🛡️</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Suspicious Activity
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All user behavior appears normal. The system is actively monitoring for suspicious patterns.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`
                    px-3 py-1 text-sm font-medium rounded-full
                    ${activity.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      activity.severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }
                  `}>
                    {activity.severity.toUpperCase()}
                  </span>
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {activity.activityType.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
              
              <p className="text-gray-900 dark:text-white mb-4">{activity.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">User ID</h4>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-zinc-700 px-3 py-1 rounded">
                    {activity.userId}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Confidence</h4>
                  <p className="text-sm">
                    <span className={`
                      font-medium
                      ${activity.confidence > 0.8 ? 'text-red-600 dark:text-red-400' :
                        activity.confidence > 0.6 ? 'text-orange-600 dark:text-orange-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }
                    `}>
                      {Math.round(activity.confidence * 100)}%
                    </span>
                  </p>
                </div>
              </div>

              {Object.keys(activity.evidence).length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    View Evidence
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-zinc-700 rounded text-sm">
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(activity.evidence, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Moderation Settings Tab Component
const ModerationSettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Moderation Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Quality Settings */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📊 Content Quality
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Quality Score
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.3"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0.0 (Permissive)</span>
                <span>1.0 (Strict)</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duplicate Detection Threshold
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                defaultValue="0.85"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0.5 (Loose)</span>
                <span>1.0 (Exact)</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Behavior Settings */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            👥 User Behavior
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Votes Per Hour
              </label>
              <input
                type="number"
                min="10"
                max="100"
                defaultValue="50"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-zinc-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Votes Per IP Per Hour
              </label>
              <input
                type="number"
                min="5"
                max="50"
                defaultValue="20"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-zinc-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Source Reliability */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📰 Source Reliability
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">BBC Asia:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">0.9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Al Jazeera:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">0.9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">RT News:</span>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">0.8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Press TV:</span>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">0.7</span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Update Source Scores
          </button>
        </div>

        {/* Auto Actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            ⚡ Auto Actions
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-reject duplicate content
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-flag suspicious voting patterns
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-suspend users with high violation scores
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-amber-800 dark:text-amber-400 text-sm">
          <strong>Note:</strong> These settings are for demonstration purposes. 
          In a production environment, these would be stored in a database and require proper authentication.
        </p>
      </div>
    </div>
  );
};

export default ModerationDashboard;