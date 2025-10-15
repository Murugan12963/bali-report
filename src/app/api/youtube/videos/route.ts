import { NextRequest, NextResponse } from 'next/server';
import { youTubeService } from '@/lib/youtube-service';

/**
 * API Route: YouTube Videos for Bali Reports Multimedia Section
 * 
 * Fetches curated video content from multipolar YouTube channels
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as 'podcasts' | 'videos' | 'analysis' | 'interviews' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    
    console.log('🎬 YouTube API request:', { category, limit, search });
    
    let videos;
    
    if (search) {
      // Search across all channels
      console.log(`🔍 Searching YouTube for: "${search}"`);
      videos = await youTubeService.searchVideos(search, limit);
    } else if (category) {
      // Get videos by category
      console.log(`📂 Fetching ${category} videos`);
      videos = await youTubeService.getVideosByCategory(category, limit);
    } else {
      // Get all videos
      console.log('📺 Fetching all videos');
      const maxPerChannel = Math.max(3, Math.floor(limit / 8)); // Distribute across channels
      videos = await youTubeService.getAllVideos(maxPerChannel);
    }
    
    console.log(`✅ YouTube API: Returning ${videos.length} videos`);
    
    return NextResponse.json({
      videos,
      total: videos.length,
      metadata: {
        fetchedAt: new Date().toISOString(),
        category: category || 'all',
        search: search || null,
        source: 'YouTube API'
      }
    });
    
  } catch (error) {
    console.error('💥 YouTube API Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch YouTube videos',
      details: error instanceof Error ? error.message : 'Unknown error',
      videos: [],
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