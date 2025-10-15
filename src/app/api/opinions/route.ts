import { NextRequest, NextResponse } from 'next/server';
import { getRssAppSourcesByCategory } from '@/lib/rss-sources-rssapp';
import { Article } from '@/lib/rss-parser';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:thumbnail', 'media:content', 'enclosure']
  }
});

/**
 * API Route: Opinion Articles from RSS.app Feeds
 * 
 * Aggregates opinion content from curated RSS.app feeds including:
 * - SCMP Opinion & Analysis
 * - NDTV Opinion & Commentary  
 * - Global Times Opinion
 * - RT Opinion & Op-eds
 * - Jakarta Post Opinion
 * - Multipolar Opinion Aggregator
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log('🗞️ Fetching opinion articles from RSS.app feeds...');
    
    // Get opinion sources from RSS.app configuration
    const opinionSources = getRssAppSourcesByCategory('OPINION');
    console.log(`📰 Found ${opinionSources.length} opinion RSS.app sources`);
    
    if (opinionSources.length === 0) {
      return NextResponse.json({
        articles: [],
        total: 0,
        sources: [],
        message: 'No opinion RSS sources configured'
      });
    }
    
    // Fetch articles from all opinion sources
    const allArticles: Article[] = [];
    const sourceStats: { [key: string]: number } = {};
    
    for (const source of opinionSources) {
      try {
        console.log(`📡 Fetching from ${source.name}...`);
        
        // Parse RSS feed
        const feed = await parser.parseURL(source.url);
        
        // Convert feed items to Article format
        const articles: Article[] = feed.items.map((item, index) => {
          // Extract image from various possible fields
          let imageUrl = '';
          if (item['media:thumbnail']) {
            imageUrl = item['media:thumbnail'].$ ? item['media:thumbnail'].$.url : item['media:thumbnail'];
          } else if (item['media:content']) {
            imageUrl = item['media:content'].$ ? item['media:content'].$.url : item['media:content'];
          } else if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
          }
          
          return {
            id: `${source.rssAppId}_${index}_${Date.now()}`,
            title: item.title || 'Untitled Opinion',
            link: item.link || '#',
            description: item.contentSnippet || item.content || item.summary || '',
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            author: (item as any).creator || (item as any).author || 'Editorial Team',
            category: 'Opinion',
            source: source.name,
            sourceUrl: source.url,
            imageUrl: imageUrl || undefined
          };
        });
        
        allArticles.push(...articles);
        sourceStats[source.name] = articles.length;
        
        console.log(`✅ ${source.name}: ${articles.length} opinion articles`);
        
      } catch (sourceError) {
        console.error(`❌ Error fetching from ${source.name}:`, sourceError);
        sourceStats[source.name] = 0;
      }
    }
    
    // Sort articles by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    // Apply pagination
    const paginatedArticles = allArticles.slice(offset, offset + limit);
    
    console.log(`📊 Opinion aggregation complete: ${allArticles.length} total articles, returning ${paginatedArticles.length}`);
    
    return NextResponse.json({
      articles: paginatedArticles,
      total: allArticles.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < allArticles.length
      },
      sources: sourceStats,
      metadata: {
        aggregatedAt: new Date().toISOString(),
        sourceCount: opinionSources.length,
        activeFeeds: Object.keys(sourceStats).filter(source => sourceStats[source] > 0).length
      }
    });
    
  } catch (error) {
    console.error('💥 Opinion API Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch opinion articles',
      details: error instanceof Error ? error.message : 'Unknown error',
      articles: [],
      total: 0
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}