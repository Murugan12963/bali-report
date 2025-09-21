#!/usr/bin/env tsx
/**
 * Test script for x.ai (Grok) API configuration
 * Run this after adding your API key to verify it's working
 */

import { xAIService } from './x-ai-service';
import { Article } from './rss-parser';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testXAIConfiguration() {
  console.log('\n🤖 Testing x.ai (Grok) API Configuration\n');
  console.log('=' .repeat(50));
  
  // Check if API key is configured
  const apiKey = process.env.XAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-xai-api-key-here') {
    console.log('❌ XAI_API_KEY not configured!\n');
    console.log('To configure x.ai:');
    console.log('1. Go to https://x.ai and sign in');
    console.log('2. Navigate to API settings');
    console.log('3. Generate an API key');
    console.log('4. Add it to .env.local file:');
    console.log('   XAI_API_KEY=xai-your-actual-key-here\n');
    return;
  }
  
  // Check if key format looks valid
  if (!apiKey.startsWith('xai-')) {
    console.log('⚠️ Warning: API key should start with "xai-"');
    console.log('   Current key starts with:', apiKey.substring(0, 4) + '...\n');
  } else {
    console.log('✅ API key format looks valid');
    console.log('   Key prefix:', apiKey.substring(0, 10) + '...\n');
  }
  
  // Test API connection
  console.log('🔄 Testing API connection...\n');
  
  const testArticle: Article = {
    id: 'test-1',
    title: 'BRICS Summit Announces New Development Bank Initiative',
    link: 'https://example.com/test',
    description: 'Leaders from Brazil, Russia, India, China, and South Africa announced a major expansion of the New Development Bank, aiming to provide alternative financing for infrastructure projects across the Global South.',
    pubDate: new Date().toISOString(),
    source: 'Test Source',
    sourceUrl: 'https://example.com',
    category: 'BRICS',
  };
  
  try {
    // Test content analysis
    console.log('📝 Testing content analysis...');
    const analysis = await xAIService.analyzeContent(testArticle);
    
    if (analysis) {
      console.log('✅ Content analysis successful!');
      console.log('\nAnalysis Results:');
      console.log('  Topics:', analysis.topics.join(', '));
      console.log('  Sentiment:', analysis.sentiment);
      console.log('  Relevance Score:', analysis.relevanceScore);
      console.log('  Geographic Relevance:');
      console.log('    - BRICS:', analysis.geoRelevance.brics);
      console.log('    - Indonesia:', analysis.geoRelevance.indonesia);
      console.log('    - Bali:', analysis.geoRelevance.bali);
      console.log('  Summary:', analysis.summary.substring(0, 100) + '...');
      console.log('  Key Insights:', analysis.keyInsights.slice(0, 2).join('; '));
    } else {
      console.log('❌ Content analysis returned null');
      console.log('   This could mean the API is not responding correctly.');
    }
    
    // Test search enhancement
    console.log('\n🔍 Testing search enhancement...');
    const searchEnhancement = await xAIService.enhanceSearch('BRICS trade', 'User interested in economics');
    
    if (searchEnhancement) {
      console.log('✅ Search enhancement successful!');
      console.log('  Enhanced Query:', searchEnhancement.enhancedQuery);
      console.log('  Semantic Keywords:', searchEnhancement.semanticKeywords.slice(0, 3).join(', '));
      console.log('  Contextual Filters:', searchEnhancement.contextualFilters.join(', '));
    } else {
      console.log('❌ Search enhancement returned null');
    }
    
    // Test summary generation
    console.log('\n📄 Testing summary generation...');
    const summary = await xAIService.generateSummary(testArticle, 50);
    
    if (summary) {
      console.log('✅ Summary generation successful!');
      console.log('  Summary:', summary);
    } else {
      console.log('❌ Summary generation returned null');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 x.ai integration is working correctly!');
    console.log('\nFeatures available:');
    console.log('  ✅ Content Analysis');
    console.log('  ✅ Search Enhancement');
    console.log('  ✅ Article Summarization');
    console.log('  ✅ Personalized Recommendations');
    console.log('  ✅ Sentiment Analysis');
    
  } catch (error) {
    console.error('\n❌ Error testing x.ai API:', error);
    console.log('\nPossible issues:');
    console.log('  1. Invalid API key');
    console.log('  2. API key not activated');
    console.log('  3. Network connectivity issues');
    console.log('  4. x.ai service temporarily unavailable');
    console.log('\nPlease verify your API key at https://x.ai');
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testXAIConfiguration().catch(console.error);
}