'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ComplianceDashboard from '@/components/ComplianceDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Globe, 
  Users, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  Scale,
  BookOpen,
  ExternalLink
} from 'lucide-react';

const CompliancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Compliance & Data Protection Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive GDPR, Indonesian UU ITE, and BRICS Partnership for Development compliance monitoring
          </p>
        </div>

        {/* Compliance Frameworks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-green-800">GDPR Compliance</CardTitle>
                  <CardDescription className="text-green-600">
                    European data protection standards
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Data minimization principles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Right to erasure & portability</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Consent management</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-blue-800">UU ITE Law</CardTitle>
                  <CardDescription className="text-blue-600">
                    Indonesian digital regulations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Content moderation standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Cultural sensitivity requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Religious value protection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-purple-800">BPD Values</CardTitle>
                  <CardDescription className="text-purple-600">
                    BRICS Partnership principles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Mutual respect & equality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Multipolar cooperation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Cultural inclusiveness</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Guidelines
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ErrorBoundary 
              showDetails={process.env.NODE_ENV === 'development'}
              fallback={
                <Card className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Dashboard Unavailable</h3>
                  <p className="text-gray-600">Unable to load compliance dashboard. Please try refreshing the page.</p>
                </Card>
              }
            >
              <Suspense fallback={
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading compliance dashboard...</p>
                </Card>
              }>
                <ComplianceDashboard />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="policies">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Policy
                  </CardTitle>
                  <CardDescription>
                    How we collect, use, and protect your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Data Collection</span>
                      <Badge variant="secondary">Minimal</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Third-party Sharing</span>
                      <Badge variant="destructive">None</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Cookie Usage</span>
                      <Badge>Essential Only</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>Data Retention</span>
                      <Badge variant="outline">Limited</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Guidelines
                  </CardTitle>
                  <CardDescription>
                    Standards for respectful discourse and content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Hate Speech</span>
                      <Badge variant="destructive">Prohibited</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Cultural Sensitivity</span>
                      <Badge>Required</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span>Fact Checking</span>
                      <Badge variant="secondary">Encouraged</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>Multipolar Respect</span>
                      <Badge>Essential</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Terms of Service
                  </CardTitle>
                  <CardDescription>
                    Legal terms governing platform usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      By using Bali Report, you agree to comply with Indonesian UU ITE regulations
                      and respect cultural diversity and multipolar values.
                    </p>
                    <p>
                      AI-generated content is clearly marked and subject to human oversight
                      for accuracy and cultural appropriateness.
                    </p>
                    <p>
                      User data is processed in accordance with GDPR principles and
                      Indonesian data protection requirements.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    AI Ethics Framework
                  </CardTitle>
                  <CardDescription>
                    Principles guiding AI-generated content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      All AI content generation follows BPD values of mutual respect,
                      cultural exchange, and peaceful coexistence.
                    </p>
                    <p>
                      Bias detection and cultural sensitivity analysis is performed
                      on all AI-generated content before publication.
                    </p>
                    <p>
                      Transparency in AI model attribution and capability limitations
                      is maintained for all automated content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guidelines">
            <Card>
              <CardHeader>
                <CardTitle>Content Creation Guidelines</CardTitle>
                <CardDescription>
                  Best practices for creating compliant, culturally sensitive content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Cultural Sensitivity
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 ml-7">
                      <li>• Respect Indonesian cultural values and religious diversity</li>
                      <li>• Use inclusive language that acknowledges multiple perspectives</li>
                      <li>• Avoid cultural stereotypes and generalizations</li>
                      <li>• Consider local context and sensitivities</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                      BRICS Partnership Values
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 ml-7">
                      <li>• Promote mutual respect and sovereign equality</li>
                      <li>• Emphasize south-south cooperation and cultural exchange</li>
                      <li>• Support multipolar world order perspectives</li>
                      <li>• Highlight win-win cooperation opportunities</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                      Legal Compliance
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 ml-7">
                      <li>• Verify information sources and avoid misinformation</li>
                      <li>• Respect intellectual property and attribution requirements</li>
                      <li>• Ensure content meets UU ITE regulation standards</li>
                      <li>• Maintain GDPR compliance for data handling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Legal Resources
                  </CardTitle>
                  <CardDescription>
                    Official documentation and legal frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a 
                      href="https://gdpr.eu/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm">GDPR Official Guide</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                    <a 
                      href="https://peraturan.bpk.go.id/Home/Details/38870" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm">Indonesian UU ITE Law</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                    <a 
                      href="https://www.brics-info.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm">BRICS Partnership Info</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Documentation
                  </CardTitle>
                  <CardDescription>
                    Technical guides and implementation details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <span className="text-sm">Compliance API Reference</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <span className="text-sm">Content Moderation Guide</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <span className="text-sm">Error Handling Best Practices</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <Shield className="h-4 w-4" />
            <span>Compliant with GDPR, UU ITE, and BPD values</span>
          </div>
          <p className="text-xs text-gray-400">
            This compliance center is updated regularly to reflect current regulations and best practices. 
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;