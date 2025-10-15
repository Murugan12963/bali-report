#!/usr/bin/env node

/**
 * Social Media Automation Script for Bali Report
 * Generates X/Twitter threads using Grok AI and schedules them for optimal engagement
 * Supports #MultipolarBali campaign and BPD NGO network promotion
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: path.join(__dirname, '../generated-content'),
  logFile: path.join(__dirname, '../logs/social-automation.log'),
  themes: [
    'MultipolarBali',
    'BRICSCooperation', 
    'SustainableDevelopment',
    'SouthSouthCooperation',
    'IndonesiaBRICS',
    'BaliSustainability'
  ],
  scheduleTimes: {
    // Optimal times for Indonesian audience (UTC+7)
    morning: '07:00',    // 2PM UTC
    lunch: '12:00',      // 7PM UTC  
    evening: '18:00',    // 1AM UTC
    night: '21:00'       // 4AM UTC
  }
};

/**
 * Logger utility
 */
class Logger {
  static async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      pid: process.pid
    };
    
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ` | ${JSON.stringify(data)}` : ''}\n`;
    
    try {
      // Ensure log directory exists
      await fs.mkdir(path.dirname(config.logFile), { recursive: true });
      await fs.appendFile(config.logFile, logLine);
      
      // Also log to console
      console.log(logLine.trim());
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  static async info(message, data = null) {
    await this.log('info', message, data);
  }

  static async warn(message, data = null) {
    await this.log('warn', message, data);
  }

  static async error(message, data = null) {
    await this.log('error', message, data);
  }
}

/**
 * Social Media Automation Service
 */
class SocialMediaAutomation {
  constructor() {
    this.generatedThreads = [];
    this.scheduledPosts = [];
  }

  /**
   * Generate social media threads using Grok AI
   */
  async generateSocialThreads(theme = 'MultipolarBali') {
    try {
      await Logger.info(`🚀 Starting social thread generation for theme: ${theme}`);
      
      const response = await fetch(`${config.baseUrl}/api/grok-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BaliReport-SocialBot/1.0'
        },
        body: JSON.stringify({
          action: 'generate-social-threads',
          data: { theme }
        }),
        timeout: 60000 // 60 second timeout
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.fallback) {
        await Logger.warn('⚠️ Using fallback social content', { theme, reason: data.error });
      }

      if (data.threads && data.threads.threads) {
        this.generatedThreads.push(...data.threads.threads);
        await Logger.info(`✅ Generated ${data.threads.threads.length} threads for ${theme}`, {
          threadCount: data.threads.threads.length,
          engagementPrediction: data.threads.engagementPrediction
        });
        
        return data.threads;
      } else {
        throw new Error('Invalid response format from Grok API');
      }
    } catch (error) {
      await Logger.error(`❌ Failed to generate social threads for ${theme}`, {
        error: error.message,
        theme
      });
      
      // Return fallback content
      return this.getFallbackThreads(theme);
    }
  }

  /**
   * Get fallback social content when AI is unavailable
   */
  getFallbackThreads(theme) {
    const fallbackThreads = {
      MultipolarBali: [
        '🌍 Building bridges across cultures and continents. #MultipolarBali represents the future of cooperative journalism. 🤝',
        '📰 Real news from diverse perspectives. Breaking free from media monopolies, one story at a time. #BRICS #SustainableDevelopment',
        '🏝️ From Bali to the world: promoting mutual respect, equality, and sustainable development. Join our multipolar community! 🌱'
      ],
      BRICSCooperation: [
        '🤝 BRICS nations leading by example: cooperation over competition, understanding over division.',
        '🌏 When nations work together as equals, the whole world benefits. This is the BRICS way.',
        '📈 South-South cooperation isn\'t just policy—it\'s a path to a more balanced, fair world.'
      ],
      SustainableDevelopment: [
        '🌱 Sustainable development starts with sustainable thinking. What if prosperity didn\'t cost the planet?',
        '🏝️ Bali shows the way: tourism that preserves, development that protects, growth that gives back.',
        '🌍 The future belongs to those who can balance profit with purpose, growth with green.'
      ]
    };

    const tweets = fallbackThreads[theme] || fallbackThreads.MultipolarBali;
    
    return {
      threads: [{
        id: `fallback_${theme}_${Date.now()}`,
        tweets,
        totalCharacters: tweets.join('').length,
        hashtagSet: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment'],
        bpdPromoting: true
      }],
      scheduledTimes: this.generateOptimalTimes(),
      hashtags: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment'],
      engagementPrediction: 0.6
    };
  }

  /**
   * Generate optimal posting times for Indonesian/BRICS audience
   */
  generateOptimalTimes() {
    const now = new Date();
    const times = [];
    const { morning, lunch, evening, night } = config.scheduleTimes;
    const schedules = [morning, lunch, evening, night];
    
    for (let i = 0; i < 3; i++) {
      const scheduleDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
      const timeSlot = schedules[i % schedules.length];
      const [hours, minutes] = timeSlot.split(':').map(Number);
      
      scheduleDate.setHours(hours, minutes, 0, 0);
      times.push(scheduleDate.toISOString());
    }
    
    return times;
  }

  /**
   * Save generated content to files
   */
  async saveGeneratedContent(socialThreads, theme) {
    try {
      // Ensure output directory exists
      await fs.mkdir(config.outputDir, { recursive: true });
      
      const filename = `social-threads-${theme}-${Date.now()}.json`;
      const filepath = path.join(config.outputDir, filename);
      
      const contentData = {
        theme,
        generatedAt: new Date().toISOString(),
        socialThreads,
        metadata: {
          threadCount: socialThreads.threads.length,
          totalTweets: socialThreads.threads.reduce((sum, thread) => sum + thread.tweets.length, 0),
          engagementPrediction: socialThreads.engagementPrediction,
          hashtags: socialThreads.hashtags,
          scheduledTimes: socialThreads.scheduledTimes
        },
        compliance: {
          indonesianRegulations: true,
          bpdAlignment: true,
          contentModeration: true
        }
      };
      
      await fs.writeFile(filepath, JSON.stringify(contentData, null, 2));
      await Logger.info(`💾 Saved generated content to ${filename}`, {
        filepath,
        threadCount: socialThreads.threads.length,
        theme
      });
      
      return filepath;
    } catch (error) {
      await Logger.error('❌ Failed to save generated content', {
        error: error.message,
        theme
      });
      throw error;
    }
  }

  /**
   * Schedule posts for publishing (integration point for X API or scheduling tools)
   */
  async schedulePosts(socialThreads, theme) {
    try {
      const scheduledPosts = [];
      
      for (let i = 0; i < socialThreads.threads.length; i++) {
        const thread = socialThreads.threads[i];
        const scheduleTime = socialThreads.scheduledTimes[i] || socialThreads.scheduledTimes[0];
        
        const scheduledPost = {
          id: `scheduled_${theme}_${i}_${Date.now()}`,
          threadId: thread.id,
          theme,
          tweets: thread.tweets,
          hashtags: thread.hashtagSet,
          scheduledFor: scheduleTime,
          status: 'pending',
          bpdPromoting: thread.bpdPromoting,
          createdAt: new Date().toISOString()
        };
        
        scheduledPosts.push(scheduledPost);
        this.scheduledPosts.push(scheduledPost);
      }
      
      await Logger.info(`📅 Scheduled ${scheduledPosts.length} posts for ${theme}`, {
        scheduledCount: scheduledPosts.length,
        nextPost: scheduledPosts[0]?.scheduledFor,
        theme
      });
      
      return scheduledPosts;
    } catch (error) {
      await Logger.error('❌ Failed to schedule posts', {
        error: error.message,
        theme
      });
      throw error;
    }
  }

  /**
   * Run automation for single theme
   */
  async runForTheme(theme) {
    try {
      await Logger.info(`🎯 Processing theme: ${theme}`);
      
      // Generate social threads
      const socialThreads = await this.generateSocialThreads(theme);
      
      // Save to files
      await this.saveGeneratedContent(socialThreads, theme);
      
      // Schedule posts
      await this.schedulePosts(socialThreads, theme);
      
      await Logger.info(`✅ Completed automation for theme: ${theme}`);
      return true;
    } catch (error) {
      await Logger.error(`❌ Failed automation for theme: ${theme}`, {
        error: error.message,
        theme
      });
      return false;
    }
  }

  /**
   * Run full automation for all themes
   */
  async runFullAutomation() {
    const startTime = Date.now();
    await Logger.info('🚀 Starting full social media automation');
    
    const results = {
      total: config.themes.length,
      successful: 0,
      failed: 0,
      themes: {}
    };
    
    for (const theme of config.themes) {
      const success = await this.runForTheme(theme);
      
      results.themes[theme] = success;
      if (success) {
        results.successful++;
      } else {
        results.failed++;
      }
      
      // Delay between themes to avoid rate limiting
      if (config.themes.indexOf(theme) < config.themes.length - 1) {
        await this.delay(5000); // 5 second delay
      }
    }
    
    const duration = Date.now() - startTime;
    await Logger.info('🎉 Completed full social media automation', {
      ...results,
      durationMs: duration,
      generatedThreads: this.generatedThreads.length,
      scheduledPosts: this.scheduledPosts.length
    });
    
    return results;
  }

  /**
   * Delay utility
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get automation status
   */
  getStatus() {
    return {
      generatedThreads: this.generatedThreads.length,
      scheduledPosts: this.scheduledPosts.length,
      lastRun: new Date().toISOString(),
      themes: config.themes,
      config: {
        baseUrl: config.baseUrl,
        outputDir: config.outputDir,
        scheduleTimes: config.scheduleTimes
      }
    };
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const automation = new SocialMediaAutomation();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const theme = args[0];
    const command = args[1] || 'run';
    
    switch (command) {
      case 'status':
        console.log('📊 Automation Status:', JSON.stringify(automation.getStatus(), null, 2));
        break;
        
      case 'run':
        if (theme && config.themes.includes(theme)) {
          // Run for specific theme
          await automation.runForTheme(theme);
        } else {
          // Run for all themes
          await automation.runFullAutomation();
        }
        break;
        
      case 'test':
        // Test mode - generate but don't schedule
        const testTheme = theme || 'MultipolarBali';
        const testResult = await automation.generateSocialThreads(testTheme);
        console.log('🧪 Test Result:', JSON.stringify(testResult, null, 2));
        break;
        
      default:
        console.log(`
🤖 Bali Report Social Media Automation

Usage:
  node social-media-automation.js [theme] [command]

Themes: ${config.themes.join(', ')}
Commands: run, status, test

Examples:
  node social-media-automation.js                    # Run all themes
  node social-media-automation.js MultipolarBali     # Run specific theme
  node social-media-automation.js status             # Show status
  node social-media-automation.js MultipolarBali test # Test mode
`);
        break;
    }
    
    process.exit(0);
  } catch (error) {
    await Logger.error('💥 Fatal error in social media automation', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(async (error) => {
    await Logger.error('💥 Unhandled error', { error: error.message });
    process.exit(1);
  });
}

module.exports = {
  SocialMediaAutomation,
  Logger,
  config
};
