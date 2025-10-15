'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Globe,
  Users,
  Lock,
  Refresh,
  Download,
  TrendingUp
} from 'lucide-react';

interface ComplianceStats {
  overallScore: number;
  contentChecks: number;
  gdprCompliance: number;
  uuiteCompliance: number;
  criticalIssues: number;
  warnings: number;
  lastUpdated: string;
  dailyStats: {
    approved: number;
    rejected: number;
    flagged: number;
  };
  categories: {
    content: { score: number; issues: number };
    privacy: { score: number; issues: number };
    cultural: { score: number; issues: number };
    legal: { score: number; issues: number };
  };
}

interface ComplianceIssue {
  id: string;
  type: 'violation' | 'warning' | 'recommendation';
  category: 'content' | 'privacy' | 'cultural' | 'legal';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'ignored';
}

const ComplianceDashboard: React.FC = () => {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const [statsResponse, issuesResponse] = await Promise.all([
        fetch('/api/compliance/stats'),
        fetch('/api/compliance/issues')
      ]);
      
      if (statsResponse.ok && issuesResponse.ok) {
        const statsData = await statsResponse.json();
        const issuesData = await issuesResponse.json();
        setStats(statsData);
        setIssues(issuesData);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplianceData();
    setRefreshing(false);
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/compliance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          includeStats: true, 
          includeIssues: true,
          format: 'pdf'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            GDPR & Indonesian UU ITE compliance monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <Refresh className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Score Alert */}
      <Alert className={`border-l-4 ${
        stats.overallScore >= 90 ? 'border-l-green-500 bg-green-50' :
        stats.overallScore >= 75 ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-red-500 bg-red-50'
      }`}>
        <Shield className="h-4 w-4" />
        <AlertTitle>Overall Compliance Score</AlertTitle>
        <AlertDescription>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-2xl font-bold ${getScoreColor(stats.overallScore)}`}>
              {stats.overallScore.toFixed(1)}%
            </span>
            <div className="flex-1">
              <Progress value={stats.overallScore} className="h-3" />
            </div>
            <Badge className={getScoreBadgeColor(stats.overallScore)}>
              {stats.overallScore >= 90 ? 'Excellent' :
               stats.overallScore >= 75 ? 'Good' :
               stats.overallScore >= 60 ? 'Fair' : 'Poor'}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Checks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentChecks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Today: {stats.dailyStats.approved + stats.dailyStats.rejected + stats.dailyStats.flagged}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR Score</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.gdprCompliance)}`}>
              {stats.gdprCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">European compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UU ITE Score</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.uuiteCompliance)}`}>
              {stats.uuiteCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Indonesian compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.warnings} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Content moderation results for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Approved</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">{stats.dailyStats.approved}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejected</span>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{stats.dailyStats.rejected}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Flagged for Review</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{stats.dailyStats.flagged}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>BPD Values Alignment</CardTitle>
                <CardDescription>BRICS Partnership for Development compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {((stats.categories.content.score + stats.categories.cultural.score) / 2).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Multipolar values alignment score
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <div className="font-semibold">Cultural Sensitivity</div>
                      <div className="text-blue-600">{stats.categories.cultural.score}%</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Globe className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      <div className="font-semibold">Mutual Respect</div>
                      <div className="text-green-600">{stats.categories.content.score}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Compliance Issues</CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    No compliance issues found
                  </div>
                ) : (
                  issues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityIcon(issue.severity)}
                          <div>
                            <div className="font-semibold">{issue.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {issue.category} • {issue.source}
                            </div>
                          </div>
                        </div>
                        <Badge variant={issue.type === 'violation' ? 'destructive' : 'secondary'}>
                          {issue.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(issue.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stats.categories).map(([category, data]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Compliance</CardTitle>
                  <CardDescription>
                    {data.issues} issues found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(data.score)}`}>
                        {data.score.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={data.score} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Issues: {data.issues}</span>
                      <span>
                        {data.score >= 90 ? 'Excellent' :
                         data.score >= 75 ? 'Good' :
                         data.score >= 60 ? 'Fair' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>Historical compliance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Trend analysis coming soon</p>
                  <p className="text-sm">Historical compliance data will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()} • 
        Compliance engine powered by AI-driven content analysis
      </div>
    </div>
  );
};

export default ComplianceDashboard;