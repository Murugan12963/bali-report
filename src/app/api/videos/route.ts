import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    const type = searchParams.get('type') || 'rss';

    if (!source) {
      return NextResponse.json(
        { error: 'Source parameter is required' },
        { status: 400 }
      );
    }

    // Video source configurations
    const videoSources: Record<string, any> = {
      'rt-news': {
        name: 'RT News on Rumble',
        rssUrl: 'https://rumble.com/c/RT/rss',
        channelUrl: 'https://rumble.com/c/RT'
      },
      'cgtn': {
        name: 'CGTN on Rumble',
        rssUrl: 'https://rumble.com/c/CGTN/rss',
        channelUrl: 'https://rumble.com/c/CGTN'
      },
      'press-tv': {
        name: 'Press TV on Rumble',
        rssUrl: 'https://rumble.com/c/PressTV/rss',
        channelUrl: 'https://rumble.com/c/PressTV'
      },
      'geopolitical-economy': {
        name: 'Geopolitical Economy Report',
        rssUrl: 'https://rumble.com/c/GeopoliticalEconomyReport/rss',
        channelUrl: 'https://rumble.com/c/GeopoliticalEconomyReport'
      },
      'redacted-news': {
        name: 'Redacted News',
        rssUrl: 'https://rumble.com/c/Redacted/rss',
        channelUrl: 'https://rumble.com/c/Redacted'
      },
      'the-duran': {
        name: 'The Duran',
        rssUrl: 'https://rumble.com/c/theduran/rss',
        channelUrl: 'https://rumble.com/c/theduran'
      }
    };

    const sourceConfig = videoSources[source];
    if (!sourceConfig) {
      return NextResponse.json(
        { error: 'Invalid source parameter' },
        { status: 400 }
      );
    }

    let videos: any[] = [];

    if (type === 'rss' && sourceConfig.rssUrl) {
      try {
        console.log(`🎬 Server: Fetching RSS for ${sourceConfig.name}`);
        
        const response = await axios.get(sourceConfig.rssUrl, {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
          timeout: 30000,
          maxRedirects: 5,
        });

        const $ = cheerio.load(response.data, { xmlMode: true });

        $('item').each((index, element) => {
          if (index >= 20) return false; // Limit to 20 videos

          const $item = $(element);
          
          const title = $item.find('title').text().trim();
          const link = $item.find('link').text().trim();
          const description = $item.find('description').text().trim();
          const pubDate = $item.find('pubDate').text().trim();
          
          let thumbnailUrl = $item.find('media\\:thumbnail, thumbnail').attr('url') || '';
          if (!thumbnailUrl) {
            const enclosure = $item.find('enclosure[type*="image"]').attr('url');
            if (enclosure) thumbnailUrl = enclosure;
          }

          const videoIdMatch = link.match(/rumble\.com\/([a-zA-Z0-9]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : '';

          const embedUrl = videoId ? `https://rumble.com/embed/${videoId}/` : link;

          if (title && link) {
            videos.push({
              id: `rumble-${source}-${videoId || index}`,
              title: cleanText(title),
              description: cleanText(description) || title,
              embedUrl,
              thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
              source: sourceConfig.name,
              sourceUrl: link,
              category: 'BRICS',
              duration: 'N/A',
              publishDate: pubDate || new Date().toISOString(),
              tags: extractTags(title, description),
              videoType: 'rumble'
            });
          }
        });

        console.log(`✅ Server: Fetched ${videos.length} videos from ${sourceConfig.name}`);

      } catch (rssError: any) {
        console.error(`❌ Server: RSS failed for ${sourceConfig.name}:`, rssError.message);
        
        // Try scraping as fallback if RSS fails
        if (sourceConfig.channelUrl) {
          try {
            console.log(`🔄 Server: Attempting scraping fallback for ${sourceConfig.name}`);
            
            const response = await axios.get(sourceConfig.channelUrl, {
              headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html',
              },
              timeout: 30000,
            });

            // Basic scraping implementation - can be enhanced
            const $ = cheerio.load(response.data);
            
            // Look for video elements in Rumble's structure
            $('.videostream').each((index, element) => {
              if (index >= 10) return false; // Limit fallback to 10 videos

              const $element = $(element);
              const title = $element.find('.videostream--title').text().trim();
              const link = $element.find('a').attr('href');
              
              if (title && link) {
                const fullLink = link.startsWith('http') ? link : `https://rumble.com${link}`;
                const videoIdMatch = fullLink.match(/rumble\.com\/([a-zA-Z0-9]+)/);
                const videoId = videoIdMatch ? videoIdMatch[1] : '';
                
                videos.push({
                  id: `rumble-${source}-scraped-${videoId || index}`,
                  title: cleanText(title),
                  description: title,
                  embedUrl: videoId ? `https://rumble.com/embed/${videoId}/` : fullLink,
                  thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
                  source: sourceConfig.name,
                  sourceUrl: fullLink,
                  category: 'BRICS',
                  duration: 'N/A',
                  publishDate: new Date().toISOString(),
                  tags: extractTags(title, ''),
                  videoType: 'rumble'
                });
              }
            });

            console.log(`✅ Server: Scraped ${videos.length} videos from ${sourceConfig.name}`);

          } catch (scrapeError: any) {
            console.error(`❌ Server: Scraping failed for ${sourceConfig.name}:`, scrapeError.message);
          }
        }
      }
    }

    // Return mock data if no videos were fetched
    if (videos.length === 0) {
      console.log(`⚠️ Server: No videos fetched for ${sourceConfig.name}, returning mock data`);
      videos = getMockVideos(sourceConfig.name, source);
    }

    return NextResponse.json({
      success: true,
      source: sourceConfig.name,
      videos,
      total: videos.length
    });

  } catch (error: any) {
    console.error('❌ Server: Video API error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error.message },
      { status: 500 }
    );
  }
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];
  
  // Common geopolitical terms
  const keywords = [
    'russia', 'china', 'brics', 'ukraine', 'nato', 'geopolitics',
    'economy', 'trade', 'sanctions', 'multipolar', 'western', 'analysis'
  ];
  
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags.slice(0, 5); // Limit to 5 tags
}

function getMockVideos(sourceName: string, sourceKey: string): any[] {
  return [
    {
      id: `mock-${sourceKey}-1`,
      title: `Latest Analysis from ${sourceName}`,
      description: 'Latest geopolitical analysis and news coverage',
      embedUrl: 'https://rumble.com/embed/mock1/',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
      source: sourceName,
      sourceUrl: 'https://rumble.com/mock1',
      category: 'BRICS',
      duration: '15:30',
      publishDate: new Date().toISOString(),
      tags: ['geopolitics', 'analysis'],
      videoType: 'rumble'
    },
    {
      id: `mock-${sourceKey}-2`,
      title: `Breaking News - ${sourceName}`,
      description: 'Breaking news and current events coverage',
      embedUrl: 'https://rumble.com/embed/mock2/',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800',
      source: sourceName,
      sourceUrl: 'https://rumble.com/mock2',
      category: 'BRICS',
      duration: '22:15',
      publishDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['news', 'current-events'],
      videoType: 'rumble'
    }
  ];
}