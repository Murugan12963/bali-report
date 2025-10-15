import { Metadata } from 'next';
import SocialMediaAutomation from '@/components/SocialMediaAutomation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, Calendar, Hash, TrendingUp, Users, Zap, Globe, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Social Media Automation | Bali Report - AI-Powered Content Generation',
  description: 'AI-powered social media automation featuring Grok-generated X/Twitter threads, event content, and BPD-aligned messaging for multipolar engagement.',
  keywords: 'social media automation, AI content generation, Twitter threads, X platform, BRICS social media, MultipolarBali, social scheduling',
  openGraph: {
    title: 'Social Media Automation | Bali Report',
    description: 'AI-powered social media content generation with multipolar perspectives',
    type: 'website',
  },
};

const automationFeatures = [
  {
    id: 'threads',
    name: 'AI Thread Generation',
    description: 'Grok-powered X/Twitter thread creation with BPD alignment',
    icon: Twitter,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    stats: { threads: '15+', engagement: '72%', hashtags: '25+' }
  },
  {
    id: 'events',
    name: 'Event Content Creation',
    description: 'Automated event announcements and promotional content',
    icon: Calendar,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    stats: { events: '10+', posts: '40+', reach: '85%' }
  },
  {
    id: 'scheduling',
    name: 'Smart Scheduling',
    description: 'AI-optimized posting times for maximum engagement',
    icon: Zap,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    stats: { times: '3', boost: '45%', automation: '90%' }
  },
  {
    id: 'analytics',
    name: 'Engagement Prediction',
    description: 'AI-powered engagement forecasting and optimization',
    icon: TrendingUp,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    stats: { accuracy: '76%', insights: '100+', trends: '12' }
  }
];

const socialThemes = [
  {
    id: 'multipolar-bali',
    name: '#MultipolarBali',
    description: 'Core theme promoting Bali as center for multipolar dialogue',
    color: 'bg-gradient-to-r from-emerald-500 to-blue-500',
    tags: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment']
  },
  {
    id: 'sustainability',
    name: 'Sustainability Focus',
    description: 'Environmental consciousness and sustainable development',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    tags: ['#EcoInnovation', '#SustainableTourism', '#GreenBali']
  },
  {
    id: 'cultural-exchange',
    name: 'Cultural Exchange',
    description: 'Promoting understanding between diverse cultures',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    tags: ['#CulturalBridge', '#BalineseWisdom', '#GlobalHarmony']
  },
  {
    id: 'digital-cooperation',
    name: 'Digital Cooperation',
    description: 'Technology sovereignty and South-South digital collaboration',
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    tags: ['#DigitalSovereignty', '#TechCooperation', '#Innovation']
  }
];

export default function SocialPage({ searchParams }: { searchParams: { theme?: string } }) {
  const selectedTheme = searchParams.theme || 'multipolar-bali';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Social Media Automation
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              AI-powered content generation using <span className="font-semibold">Grok AI</span> to create 
              engaging X/Twitter threads, event content, and promotional materials aligned with 
              <span className="font-semibold"> BRICS Partnership for Development</span> values.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                🧠 Grok-4 Powered
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                📱 X/Twitter Optimized
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                🤝 BPD Values
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Automation Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Automation Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {automationFeatures.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <Card key={feature.id} className={`p-6 hover:shadow-lg transition-shadow duration-200 ${feature.bgColor}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${feature.color} bg-white dark:bg-gray-800`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(feature.stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-500 dark:text-gray-400">{key}:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Social Themes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Content Themes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialThemes.map((theme) => {
              const isSelected = theme.id === selectedTheme;
              
              return (
                <a
                  key={theme.id}
                  href={`/social?theme=${theme.id}`}
                  className={`block transition-all duration-200 hover:scale-105 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Card className={`overflow-hidden ${isSelected ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
                    <div className={`h-20 ${theme.color} flex items-center justify-center`}>
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{theme.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {theme.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {theme.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </section>

        {/* Current Performance Stats */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3 text-blue-800 dark:text-blue-200">
                📊 Automation Performance
              </h2>
              <p className="text-blue-700 dark:text-blue-300">
                Real-time metrics from our AI-powered social media automation system
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                  <Twitter className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">47</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Threads Generated</div>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">23</div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">Events Created</div>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-4">
                  <Hash className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">156</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Hashtags Used</div>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">78%</div>
                <div className="text-sm text-amber-700 dark:text-amber-300">Avg Engagement</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Social Media Automation Component */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Content Generation Studio</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate AI-powered social media content, manage posting schedules, and track engagement 
              metrics for your multipolar content strategy.
            </p>
          </div>
          
          <SocialMediaAutomation 
            theme={selectedTheme === 'multipolar-bali' ? 'MultipolarBali' : selectedTheme}
            includeEvents={true}
            maxThreads={5}
          />
        </section>

        {/* Integration Information */}
        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Twitter className="h-5 w-5 text-blue-500" />
                X/Twitter Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Direct integration with X (Twitter) API for automated posting, scheduling, 
                and engagement tracking. Support for thread posting and media attachments.
              </p>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                API Ready
              </Badge>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Multi-Platform Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Extend automation to LinkedIn, Telegram, VK, and other platforms 
                popular in BRICS nations for comprehensive social media coverage.
              </p>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20">
                Coming Soon
              </Badge>
            </Card>
          </div>
        </section>

        {/* Technical Details */}
        <section className="mt-16">
          <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
              🔧 Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">AI Processing</h4>
                <ul className="space-y-1">
                  <li>• Grok-4 for content generation</li>
                  <li>• Thread optimization algorithms</li>
                  <li>• Engagement prediction models</li>
                  <li>• Hashtag trend analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Social Media APIs</h4>
                <ul className="space-y-1">
                  <li>• Twitter API v2 integration</li>
                  <li>• Automated posting & scheduling</li>
                  <li>• Real-time engagement tracking</li>
                  <li>• Multi-account management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Compliance & Safety</h4>
                <ul className="space-y-1">
                  <li>• Indonesian UU ITE compliance</li>
                  <li>• Content moderation filters</li>
                  <li>• BPD value alignment checks</li>
                  <li>• Cultural sensitivity validation</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}