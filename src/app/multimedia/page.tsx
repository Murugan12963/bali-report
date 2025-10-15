import { Metadata } from 'next';
import VideoEnrichment from '@/components/VideoEnrichment';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Sparkles, Globe, Leaf, Camera, Mic } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Multimedia & Videos | Bali Report - AI-Enhanced Content',
  description: 'AI-powered multimedia content analysis featuring Grok Vision enhancement, sustainable development focus, and Bali cultural context.',
  keywords: 'multimedia, video analysis, AI enhancement, Grok Vision, sustainable development, Bali culture, YouTube videos, accessibility',
  openGraph: {
    title: 'Multimedia & Videos | Bali Report',
    description: 'AI-enhanced multimedia content with sustainability focus and cultural context',
    type: 'website',
  },
};

// Sample video datasets for different categories
const videoCategories = {
  sustainability: [
    {
      id: 'sustain-1',
      title: 'Bali\'s Zero Waste Villages: A Model for Southeast Asia',
      description: 'Documentary exploring how traditional Balinese villages are implementing zero-waste practices, combining ancient wisdom with modern sustainability principles.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1280&h=720&fit=crop',
      duration: '15:42',
      channelName: 'Sustainable Asia',
      publishedAt: '2025-01-12'
    },
    {
      id: 'sustain-2',
      title: 'Renewable Energy Revolution in Indonesia',
      description: 'How Indonesia is transitioning to renewable energy with help from BRICS partnerships, focusing on solar and geothermal initiatives.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1280&h=720&fit=crop',
      duration: '22:18',
      channelName: 'Green Energy Asia',
      publishedAt: '2025-01-10'
    },
    {
      id: 'sustain-3',
      title: 'Coral Reef Restoration: Bali\'s Marine Conservation Efforts',
      description: 'Local communities and international partners work together to restore Bali\'s coral reefs using innovative sustainable techniques.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1280&h=720&fit=crop',
      duration: '18:33',
      channelName: 'Marine Conservation Indonesia',
      publishedAt: '2025-01-08'
    }
  ],
  culture: [
    {
      id: 'culture-1',
      title: 'Preserving Balinese Traditions in Modern Times',
      description: 'How younger generations in Bali are maintaining cultural traditions while embracing sustainable development and global connectivity.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1280&h=720&fit=crop',
      duration: '25:15',
      channelName: 'Cultural Heritage Indonesia',
      publishedAt: '2025-01-14'
    },
    {
      id: 'culture-2',
      title: 'Temple Architecture and Environmental Harmony',
      description: 'Exploring how traditional Balinese temple design principles align with modern sustainable architecture and ecological balance.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555400493-6161c6244167?w=1280&h=720&fit=crop',
      duration: '12:48',
      channelName: 'Sacred Spaces Asia',
      publishedAt: '2025-01-11'
    }
  ],
  development: [
    {
      id: 'dev-1',
      title: 'BRICS Investment in Indonesian Infrastructure',
      description: 'Documentary on major BRICS-funded infrastructure projects in Indonesia and their impact on sustainable development goals.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1280&h=720&fit=crop',
      duration: '28:42',
      channelName: 'BRICS Development Watch',
      publishedAt: '2025-01-13'
    },
    {
      id: 'dev-2',
      title: 'Digital Villages: Technology Bridging Rural-Urban Divide',
      description: 'How digital technology initiatives in Bali are connecting rural communities while preserving local culture and promoting sustainable practices.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1280&h=720&fit=crop',
      duration: '16:27',
      channelName: 'Digital Indonesia',
      publishedAt: '2025-01-09'
    }
  ]
};

const categories = [
  {
    id: 'sustainability',
    name: 'Sustainability',
    description: 'Environmental conservation and sustainable development initiatives',
    icon: Leaf,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    videos: videoCategories.sustainability
  },
  {
    id: 'culture',
    name: 'Culture & Heritage',
    description: 'Preserving traditions in a modern sustainable context',
    icon: Globe,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    videos: videoCategories.culture
  },
  {
    id: 'development',
    name: 'Development',
    description: 'BRICS partnerships and sustainable infrastructure projects',
    icon: Sparkles,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    videos: videoCategories.development
  }
];

export default function MultimediaPage({ searchParams }: { searchParams: { category?: string } }) {
  const selectedCategory = searchParams.category || 'sustainability';
  const currentCategory = categories.find(cat => cat.id === selectedCategory) || categories[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Camera className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              AI-Enhanced Multimedia
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              Experience <span className="font-semibold">Grok Vision</span> powered video analysis that connects 
              multimedia content to sustainable development, cultural preservation, and multipolar perspectives.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                👁️ Grok Vision AI
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                🌱 Sustainability Focus
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-2">
                🏝️ Bali Cultural Context
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Selection */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Explore by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = category.id === selectedCategory;
              
              return (
                <a
                  key={category.id}
                  href={`/multimedia?category=${category.id}`}
                  className={`block transition-all duration-200 hover:scale-105 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Card className={`p-6 h-full ${isSelected ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'} ${category.bgColor}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${category.color} bg-white dark:bg-gray-800`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-xl">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {category.videos.length} videos
                      </span>
                      {isSelected && (
                        <Badge variant="default" className="bg-blue-500">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </section>

        {/* AI Enhancement Features */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border-violet-200 dark:border-violet-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3 text-violet-800 dark:text-violet-200">
                🚀 AI Enhancement Features
              </h2>
              <p className="text-violet-700 dark:text-violet-300">
                How Grok Vision transforms video content for better accessibility and understanding
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-800 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <h4 className="font-semibold text-violet-800 dark:text-violet-200 mb-2">Vision Analysis</h4>
                <p className="text-sm text-violet-700 dark:text-violet-300">AI analyzes video thumbnails and visual content</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Sustainability Tags</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Automatic tagging for SDG and environmental themes</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Cultural Context</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Connects content to Balinese and Indonesian culture</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-4">
                  <Mic className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Accessibility</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">Enhanced descriptions for screen readers</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Video Enrichment Section */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${currentCategory.color} ${currentCategory.bgColor}`}>
                <currentCategory.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{currentCategory.name} Videos</h2>
                <p className="text-gray-600 dark:text-gray-400">{currentCategory.description}</p>
              </div>
            </div>
            
            {/* Category Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {currentCategory.videos.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Videos</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  100%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Enhanced</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  15
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg SDG Tags</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  18min
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Length</div>
              </Card>
            </div>
          </div>
          
          <VideoEnrichment 
            videos={currentCategory.videos} 
            maxVideos={6}
            category={selectedCategory as 'sustainability' | 'culture' | 'development' | 'tourism' | 'general'}
          />
        </section>

        {/* Additional Features */}
        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Coming Soon: Live Video Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Real-time AI analysis of live streams and video uploads with instant 
                sustainability tagging and cultural context generation.
              </p>
              <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20">
                In Development
              </Badge>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-500" />
                Interactive Video Features
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Timeline annotations, key moment highlighting, and interactive 
                sustainability assessments for educational content.
              </p>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                Planned
              </Badge>
            </Card>
          </div>
        </section>

        {/* Technical Information */}
        <section className="mt-16">
          <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
              🔧 Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">AI Processing</h4>
                <ul className="space-y-1">
                  <li>• Grok-Vision-4-Preview for image analysis</li>
                  <li>• Grok-4 for text content enhancement</li>
                  <li>• Real-time thumbnail processing</li>
                  <li>• SDG alignment scoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Compliance & Accessibility</h4>
                <ul className="space-y-1">
                  <li>• Indonesian UU ITE compliance</li>
                  <li>• WCAG 2.1 AA accessibility standards</li>
                  <li>• Cultural sensitivity filtering</li>
                  <li>• Multi-language support</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}