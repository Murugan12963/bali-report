'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';

interface OpinionEssay {
  id: string;
  title: string;
  summary: string;
  content: string;
  mainArgument: string;
  counterArguments: string[];
  sources: Array<{
    title: string;
    url: string;
    type: 'rss' | 'x' | 'analysis';
  }>;
  bpdAlignment: {
    score: number;
    reasoning: string;
    multipolarity: number;
    sustainability: number;
    inclusiveness: number;
  };
  generatedAt: string;
  readingTime: number;
  topics: string[];
  confidence: number;
}

interface AutomatedOpinionProps {
  category?: 'brics' | 'indonesia' | 'bali' | 'global';
  maxEssays?: number;
}

export default function AutomatedOpinion({ 
  category = 'global', 
  maxEssays = 3 
}: AutomatedOpinionProps) {
  const [essays, setEssays] = useState<OpinionEssay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<OpinionEssay | null>(null);

  const fetchOpinionEssays = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/grok-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateOpinion',
          data: {
            category,
            maxEssays,
            forceRefresh,
            analysisDepth: 'comprehensive',
            includeCounterArguments: true,
            bpdFocus: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch opinion essays: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate opinion essays');
      }

      setEssays(result.data.essays || []);
      
      // Track analytics event
      if (typeof window !== 'undefined' && (window as any)._paq) {
        (window as any)._paq.push(['trackEvent', 'AI Content', 'Opinion Generated', category, result.data.essays?.length || 0]);
      }

    } catch (err) {
      console.error('Error fetching opinion essays:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate opinion essays');
      
      // Load fallback essays from localStorage if available
      const fallbackEssays = loadFallbackEssays();
      if (fallbackEssays.length > 0) {
        setEssays(fallbackEssays);
        setError('Using cached opinion essays. AI service temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackEssays = (): OpinionEssay[] => {
    try {
      const cached = localStorage.getItem(`opinion-essays-${category}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const saveFallbackEssays = (essaysData: OpinionEssay[]) => {
    try {
      localStorage.setItem(`opinion-essays-${category}`, JSON.stringify(essaysData.slice(0, 5))); // Keep only 5 for storage
    } catch {
      // Storage full or unavailable
    }
  };

  useEffect(() => {
    fetchOpinionEssays();
  }, [category]);

  useEffect(() => {
    if (essays.length > 0) {
      saveFallbackEssays(essays);
    }
  }, [essays, category]);

  const getBpdAlignmentColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Lower Confidence';
  };

  const renderFallbackContent = () => (
    <div className="space-y-6">
      <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">AI Opinion Service Unavailable</h3>
        </div>
        <p className="text-amber-700 dark:text-amber-300 mb-4">
          Our AI-powered opinion generation system is currently unavailable. Here's what you can expect:
        </p>
        <ul className="list-disc list-inside space-y-2 text-amber-700 dark:text-amber-300">
          <li>Contrarian analysis of current {category === 'global' ? 'global' : category.toUpperCase()} news</li>
          <li>BPD-aligned perspectives on multipolar world development</li>
          <li>Balanced arguments with counter-perspectives</li>
          <li>Indonesian legal compliance and cultural sensitivity</li>
        </ul>
        <Button 
          onClick={() => fetchOpinionEssays(true)} 
          className="mt-4"
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Retry Opinion Generation
        </Button>
      </Card>
    </div>
  );

  if (loading && essays.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-emerald-600" />
        <span className="text-lg">Generating AI-powered opinion essays...</span>
      </div>
    );
  }

  if (error && essays.length === 0) {
    return renderFallbackContent();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Opinion Essays</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Contrarian analysis powered by Grok AI • {category.toUpperCase()} focus
          </p>
        </div>
        <Button
          onClick={() => fetchOpinionEssays(true)}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && essays.length > 0 && (
        <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {essays.map((essay) => (
          <Card key={essay.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  {essay.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {essay.summary}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge variant="outline" className={getBpdAlignmentColor(essay.bpdAlignment.score)}>
                  BPD: {essay.bpdAlignment.score}%
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getConfidenceLabel(essay.confidence)}
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-emerald-700 dark:text-emerald-400">
                Main Argument:
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {essay.mainArgument}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                Counter-Arguments:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {essay.counterArguments.slice(0, 2).map((arg, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                    {arg}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">
                BPD Alignment Analysis:
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block font-medium text-gray-600 dark:text-gray-400">Multipolarity</span>
                  <span className={getBpdAlignmentColor(essay.bpdAlignment.multipolarity)}>
                    {essay.bpdAlignment.multipolarity}%
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-gray-600 dark:text-gray-400">Sustainability</span>
                  <span className={getBpdAlignmentColor(essay.bpdAlignment.sustainability)}>
                    {essay.bpdAlignment.sustainability}%
                  </span>
                </div>
                <div>
                  <span className="block font-medium text-gray-600 dark:text-gray-400">Inclusiveness</span>
                  <span className={getBpdAlignmentColor(essay.bpdAlignment.inclusiveness)}>
                    {essay.bpdAlignment.inclusiveness}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {essay.bpdAlignment.reasoning}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {essay.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {essay.readingTime} min read
                </span>
                <span>{essay.sources.length} sources</span>
                <span>Generated {new Date(essay.generatedAt).toLocaleDateString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEssay(essay)}
              >
                Read Full Essay
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {essays.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Opinion Essays Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            AI opinion generation is temporarily unavailable for {category === 'global' ? 'global' : category.toUpperCase()} category.
          </p>
          <Button onClick={() => fetchOpinionEssays(true)}>
            Generate New Essays
          </Button>
        </Card>
      )}

      {/* Full Essay Modal */}
      {selectedEssay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold pr-4">{selectedEssay.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEssay(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                {selectedEssay.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-3">Sources:</h3>
                <div className="grid gap-2">
                  {selectedEssay.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-sm">{source.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.type}
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}