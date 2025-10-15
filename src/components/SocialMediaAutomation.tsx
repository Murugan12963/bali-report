'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw, 
  Twitter, 
  Calendar, 
  Hash,
  Clock,
  Users,
  TrendingUp,
  Share,
  Copy,
  ExternalLink,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface SocialThread {
  id: string;
  tweets: string[];
  totalCharacters: number;
  hashtagSet: string[];
  bpdPromoting: boolean;
  engagementPrediction: number;
  theme: string;
  scheduledTime?: string;
}

interface EventContent {
  id: string;
  title: string;
  description: string;
  eventType: 'webinar' | 'conference' | 'workshop' | 'networking' | 'cultural';
  date: string;
  socialPosts: {
    announcement: string;
    reminder: string;
    live: string;
    recap: string;
  };
  hashtags: string[];
  bricsRelevance: number;
}

interface SocialThreadsData {
  threads: SocialThread[];
  scheduledTimes: string[];
  hashtags: string[];
  engagementPrediction: number;
}

interface SocialMediaAutomationProps {
  theme?: string;
  includeEvents?: boolean;
  maxThreads?: number;
}

export default function SocialMediaAutomation({ 
  theme = 'MultipolarBali',
  includeEvents = true,
  maxThreads = 5
}: SocialMediaAutomationProps) {
  const [socialData, setSocialData] = useState<{
    threads: SocialThreadsData | null;
    events: EventContent[];
  }>({
    threads: null,
    events: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'threads' | 'events' | 'schedule'>('threads');
  const [selectedThread, setSelectedThread] = useState<SocialThread | null>(null);
  const [copiedTweet, setCopiedTweet] = useState<string | null>(null);

  const generateSocialContent = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Generate social threads
      const threadsResponse = await fetch('/api/grok-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-social-threads',
          data: {
            theme,
            maxThreads,
            forceRefresh,
            includeBpdFocus: true,
            includeEngagement: true
          }
        }),
      });

      let threadsData = null;
      if (threadsResponse.ok) {
        const result = await threadsResponse.json();
        threadsData = result.threads;
      }

      // Generate event content if requested
      let eventsData = [];
      if (includeEvents) {
        const eventsResponse = await fetch('/api/grok-enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate-events',
            data: {
              category: 'brics-bali',
              maxEvents: 3,
              forceRefresh,
              includeMultipolarFocus: true
            }
          }),
        });

        if (eventsResponse.ok) {
          const eventResult = await eventsResponse.json();
          eventsData = eventResult.events || [];
        }
      }

      setSocialData({
        threads: threadsData || generateFallbackThreads(),
        events: eventsData.length > 0 ? eventsData : generateFallbackEvents()
      });

      // Save to localStorage
      try {
        localStorage.setItem(`social-automation-${theme}`, JSON.stringify({
          threads: threadsData,
          events: eventsData,
          timestamp: Date.now()
        }));
      } catch {
        // Storage full or unavailable
      }

      // Track analytics event
      if (typeof window !== 'undefined' && (window as any)._paq) {
        (window as any)._paq.push(['trackEvent', 'Social Automation', 'Content Generated', theme, maxThreads]);
      }

    } catch (err) {
      console.error('Error generating social content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate social content');
      
      // Load cached content
      const cached = loadCachedContent();
      if (cached) {
        setSocialData(cached);
        setError('Using cached social content. AI service temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCachedContent = () => {
    try {
      const cached = localStorage.getItem(`social-automation-${theme}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return {
            threads: parsed.threads || generateFallbackThreads(),
            events: parsed.events || generateFallbackEvents()
          };
        }
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  };

  const generateFallbackThreads = (): SocialThreadsData => {
    return {
      threads: [
        {
          id: `fallback-1-${Date.now()}`,
          tweets: [
            '🌍 Building bridges across cultures and continents. #MultipolarBali represents the future of cooperative journalism. 🤝',
            '📰 Real news from diverse perspectives. Breaking free from media monopolies, one story at a time. #BRICS #SustainableDevelopment',
            '🏝️ From Bali to the world: promoting mutual respect, equality, and sustainable development. Join our multipolar community! 🌱'
          ],
          totalCharacters: 420,
          hashtagSet: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment'],
          bpdPromoting: true,
          engagementPrediction: 0.75,
          theme: 'MultipolarBali'
        },
        {
          id: `fallback-2-${Date.now()}`,
          tweets: [
            '🌊 Sustainable tourism in Bali isn\'t just an idea - it\'s happening now. Local communities leading the change. #BalitTourism',
            '♻️ Zero-waste villages, coral restoration, renewable energy. See how traditional wisdom meets modern sustainability. #EcoInnovation',
            '🙏 When ancient Hindu-Buddhist values guide modern development, magic happens. This is the Bali model. #CulturalSustainability'
          ],
          totalCharacters: 350,
          hashtagSet: ['#BaliTourism', '#EcoInnovation', '#CulturalSustainability'],
          bpdPromoting: true,
          engagementPrediction: 0.68,
          theme: 'Sustainability'
        }
      ],
      scheduledTimes: ['09:00', '15:00', '19:00'],
      hashtags: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment', '#BaliTourism', '#EcoInnovation'],
      engagementPrediction: 0.72
    };
  };

  const generateFallbackEvents = (): EventContent[] => {
    return [
      {
        id: `event-1-${Date.now()}`,
        title: 'BRICS Digital Cooperation Summit - Bali 2025',
        description: 'Virtual summit exploring digital sovereignty, sustainable technology, and South-South cooperation in the digital age.',
        eventType: 'conference',
        date: '2025-02-15',
        socialPosts: {
          announcement: '🌐 Mark your calendars! BRICS Digital Cooperation Summit comes to Bali Feb 15. Digital sovereignty meets sustainable tech. #BRICSDigital #MultipolarBali',
          reminder: '⏰ 24hrs until BRICS Digital Summit! Join experts from Brazil, Russia, India, China & beyond as we explore digital cooperation. Register now! #BRICSDigital',
          live: '🔴 LIVE NOW: BRICS Digital Cooperation Summit! Real-time insights on digital sovereignty, sustainable tech & multipolar cooperation. #BRICSDigital',
          recap: '🎯 What a summit! Key takeaways from BRICS Digital Cooperation: digital sovereignty, sustainable innovation & stronger South-South ties. Thank you Bali! #BRICSDigital'
        },
        hashtags: ['#BRICSDigital', '#MultipolarBali', '#DigitalSovereignty', '#SustainableTech'],
        bricsRelevance: 95
      }
    ];
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTweet(type);
      setTimeout(() => setCopiedTweet(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const scheduleThread = (thread: SocialThread) => {
    // This would integrate with actual social media scheduling APIs
    console.log('Scheduling thread:', thread);
    alert('Thread scheduling would be implemented with actual social media APIs (Twitter API, etc.)');
  };

  useEffect(() => {
    const cached = loadCachedContent();
    if (cached) {
      setSocialData(cached);
    } else {
      generateSocialContent();
    }
  }, [theme]);

  const renderFallbackContent = () => (
    <Card className="p-8 text-center border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
      <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
        Social Media AI Service Unavailable
      </h3>
      <p className="text-amber-700 dark:text-amber-300 mb-4">
        Our AI-powered social media generation system is currently unavailable. Here's what you can expect:
      </p>
      <ul className="list-disc list-inside space-y-2 text-amber-700 dark:text-amber-300 text-sm">
        <li>X/Twitter threads promoting #MultipolarBali and BRICS cooperation</li>
        <li>Event announcements for webinars, conferences, and cultural exchanges</li>
        <li>Sustainable development focused content with cultural sensitivity</li>
        <li>Engagement-optimized hashtags and scheduling recommendations</li>
      </ul>
      <Button onClick={() => generateSocialContent(true)} className="mt-4" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Retry Generation
      </Button>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Social Media Automation</h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered content generation • {theme} theme
          </p>
        </div>
        <Button
          onClick={() => generateSocialContent(true)}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Generate New Content
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'threads', label: 'Social Threads', icon: Twitter },
            { id: 'events', label: 'Event Content', icon: Calendar },
            { id: 'schedule', label: 'Scheduling', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {loading && !socialData.threads && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-lg">Generating social media content...</span>
        </div>
      )}

      {/* Social Threads Tab */}
      {activeTab === 'threads' && socialData.threads && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {socialData.threads.threads.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Generated Threads</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(socialData.threads.engagementPrediction * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Predicted Engagement</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {socialData.threads.hashtags.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unique Hashtags</div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {socialData.threads.threads.map((thread) => (
              <Card key={thread.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Thread #{thread.id.slice(-4)}</h3>
                    {thread.bpdPromoting && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        BPD Aligned
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {Math.round(thread.engagementPrediction * 100)}% eng.
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {thread.tweets.map((tweet, index) => (
                    <div key={index} className="relative">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                        <div className="flex items-start justify-between">
                          <span className="flex-1 mr-2">{tweet}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {tweet.length}/280
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(tweet, `tweet-${thread.id}-${index}`)}
                              className="p-1 h-auto"
                            >
                              {copiedTweet === `tweet-${thread.id}-${index}` ? (
                                <span className="text-xs text-green-600">✓</span>
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < thread.tweets.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {thread.hashtagSet.map((hashtag) => (
                    <Badge key={hashtag} variant="outline" className="text-xs">
                      <Hash className="mr-1 h-2 w-2" />
                      {hashtag.replace('#', '')}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {thread.totalCharacters} total characters
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(thread.tweets.join('\n\n'), `thread-${thread.id}`)}
                    >
                      {copiedTweet === `thread-${thread.id}` ? '✓ Copied' : 'Copy Thread'}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => scheduleThread(thread)}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {socialData.events.length > 0 ? (
            <div className="grid gap-6">
              {socialData.events.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{event.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {event.eventType}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          {event.bricsRelevance}% BRICS Relevant
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(event.socialPosts).map(([type, post]) => (
                      <div key={type} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm capitalize">{type} Post</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(post, `event-${event.id}-${type}`)}
                            className="p-1"
                          >
                            {copiedTweet === `event-${event.id}-${type}` ? (
                              <span className="text-xs text-green-600">✓</span>
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{post}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-4">
                    {event.hashtags.map((hashtag) => (
                      <Badge key={hashtag} variant="outline" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Events Generated</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Event content generation is currently unavailable.
              </p>
              <Button onClick={() => generateSocialContent(true)}>
                Generate Events
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && socialData.threads && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recommended Posting Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {socialData.threads.scheduledTimes.map((time, index) => (
                <div key={time} className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {time}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {index === 0 ? 'Morning Peak' : index === 1 ? 'Afternoon Boost' : 'Evening Engagement'}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Times optimized for Indonesian audience with global reach consideration.
            </p>
          </Card>

          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
            <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
              🚧 Integration Required
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              To enable automatic scheduling, integrate with social media APIs (Twitter API, Facebook Graph API, etc.) 
              and configure cron jobs for automated posting.
            </p>
          </Card>
        </div>
      )}

      {!loading && !socialData.threads && renderFallbackContent()}
    </div>
  );
}