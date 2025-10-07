/**
 * Web Scraper for sites without RSS feeds
 * Extracts articles from news websites and blogs
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from './rss-parser';

export interface ScraperConfig {
  name: string;
  url: string;
  category: 'BRICS' | 'Indonesia' | 'Bali';
  selectors: {
    articleList: string;        // Selector for article container
    articleLink: string;        // Selector for article URL
    articleTitle: string;       // Selector for article title
    articleDescription?: string; // Selector for article summary
    articleDate?: string;       // Selector for publication date
    articleAuthor?: string;     // Selector for author
    articleImage?: string;      // Selector for featured image
  };
  baseUrl?: string;            // Base URL if links are relative
  maxArticles?: number;        // Max articles to scrape
  active: boolean;
}

// Configuration for sites to scrape
export const SCRAPER_SOURCES: ScraperConfig[] = [
  {
    name: 'Bali Post',
    url: 'https://www.balipost.com/',
    category: 'Bali',
    selectors: {
      articleList: '.post-item, article.post',
      articleLink: 'h2 a, .post-title a',
      articleTitle: 'h2, .post-title',
      articleDescription: '.post-excerpt, .entry-summary',
      articleDate: '.post-date, time',
      articleImage: 'img'
    },
    baseUrl: 'https://www.balipost.com',
    maxArticles: 20,
    active: false // Set to true when ready to use
  },
  {
    name: 'The Bali Sun',
    url: 'https://thebalisun.com/',
    category: 'Bali',
    selectors: {
      articleList: 'article',
      articleLink: 'h2 a, h3 a',
      articleTitle: 'h2, h3',
      articleDescription: '.entry-content p:first-of-type',
      articleDate: '.entry-date',
      articleImage: '.wp-post-image'
    },
    baseUrl: 'https://thebalisun.com',
    maxArticles: 20,
    active: true  // Enabled - tested and working
  },
  {
    name: 'Coconuts Bali',
    url: 'https://coconuts.co/bali/',
    category: 'Bali',
    selectors: {
      articleList: '.post-item',
      articleLink: 'a',
      articleTitle: 'h3',
      articleDescription: '.excerpt',
      articleDate: '.date',
      articleImage: 'img'
    },
    baseUrl: 'https://coconuts.co',
    maxArticles: 20,
    active: false
  },
  {
    name: 'Bali Discovery',
    url: 'https://www.balidiscovery.com/news',
    category: 'Bali',
    selectors: {
      articleList: '.news-item, .article-item',
      articleLink: 'a',
      articleTitle: 'h3, .title',
      articleDescription: '.summary, .excerpt',
      articleDate: '.date',
      articleImage: 'img'
    },
    baseUrl: 'https://www.balidiscovery.com',
    maxArticles: 20,
    active: false
  },
  {
    name: 'NOW! Bali',
    url: 'https://nowbali.co.id/category/news/',
    category: 'Bali',
    selectors: {
      articleList: 'article',
      articleLink: 'h2 a',
      articleTitle: 'h2',
      articleDescription: '.entry-summary',
      articleDate: 'time',
      articleImage: '.post-thumbnail img'
    },
    baseUrl: 'https://nowbali.co.id',
    maxArticles: 20,
    active: true  // Enabled - tested and working
  },
  {
    name: 'Seminyak Times',
    url: 'https://www.seminyaktimes.com/',
    category: 'Bali',
    selectors: {
      articleList: '.post',
      articleLink: 'h2 a',
      articleTitle: 'h2',
      articleDescription: '.entry-summary',
      articleDate: '.published',
      articleImage: '.wp-post-image'
    },
    baseUrl: 'https://www.seminyaktimes.com',
    maxArticles: 15,
    active: false
  },
  // New geopolitical sources added
  {
    name: 'Bali Post (Main)',
    url: 'https://www.balipost.com/news/bali/',
    category: 'Bali',
    selectors: {
      articleList: 'article, .post-item, .news-item, .article-box',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .post-title',
      articleDescription: '.excerpt, .summary, .post-excerpt, p:first-of-type',
      articleDate: '.date, .post-date, time, .published',
      articleImage: 'img:first-of-type, .featured-image img, .post-thumbnail img'
    },
    baseUrl: 'https://www.balipost.com',
    maxArticles: 20,
    active: true  // Enabled - works but may need more tuning
  },
  {
    name: 'Eurasia Review',
    url: 'https://www.eurasiareview.com/',
    category: 'BRICS',
    selectors: {
      articleList: '.first-post, .following-post .single-article',
      articleLink: 'h3 a, .entry-title a',
      articleTitle: 'h3.entry-title, .entry-title',
      articleDescription: '.entry-content p, .entry-summary',
      articleDate: '.posted-on a time, .entry-date',
      articleAuthor: '.byline a',
      articleImage: 'img:first-of-type'
    },
    baseUrl: 'https://www.eurasiareview.com',
    maxArticles: 25,
    active: false  // Needs more testing with updated selectors
  },
  {
    name: 'Katehon',
    url: 'https://katehon.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .news-item, .post-item, .article-preview',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .article-title',
      articleDescription: '.excerpt, .summary, .preview-text, p:first-of-type',
      articleDate: '.date, .publish-date, time',
      articleAuthor: '.author, .by',
      articleImage: 'img:first-of-type, .featured img, .thumb img'
    },
    baseUrl: 'https://katehon.com',
    maxArticles: 20,
    active: false
  },
  {
    name: 'The Geopolitics',
    url: 'https://thegeopolitics.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .article-card, .news-item',
      articleLink: 'h2 a, h3 a, .entry-title a, a[href*="/article/"]',
      articleTitle: 'h2, h3, .entry-title, .article-title',
      articleDescription: '.entry-summary, .excerpt, .article-excerpt, p:first-of-type',
      articleDate: '.entry-date, .date, time, .published',
      articleAuthor: '.author-name, .by-author, .author',
      articleImage: '.wp-post-image, .featured-image img, .post-thumbnail img'
    },
    baseUrl: 'https://thegeopolitics.com',
    maxArticles: 20,
    active: false
  },
  {
    name: 'Modern Diplomacy',
    url: 'https://moderndiplomacy.eu/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .td-module-container, .td_module_wrap',
      articleLink: 'h3 a, .entry-title a, .td-module-title a',
      articleTitle: 'h3, .entry-title, .td-module-title',
      articleDescription: '.td-excerpt, .entry-summary, .excerpt',
      articleDate: '.td-post-date, .entry-date, time',
      articleAuthor: '.td-post-author-name, .author',
      articleImage: '.td-module-thumb img, .entry-thumb img, img:first-of-type'
    },
    baseUrl: 'https://moderndiplomacy.eu',
    maxArticles: 25,
    active: true  // Enabled - 25 articles scraped successfully
  },
  {
    name: 'SIT Journal',
    url: 'https://sitjournal.com/',
    category: 'Indonesia',
    selectors: {
      articleList: '.article-item, .journal-article, .paper, article',
      articleLink: 'a[href*="/article/"], h3 a, .title a',
      articleTitle: 'h3, .title, .article-title',
      articleDescription: '.abstract, .summary, .excerpt, p:first-of-type',
      articleDate: '.published-date, .date, time',
      articleAuthor: '.authors, .author-name',
      articleImage: 'img:first-of-type'
    },
    baseUrl: 'https://sitjournal.com',
    maxArticles: 15,
    active: false
  },
  {
    name: 'Indonesia Business Post',
    url: 'https://indonesiabusinesspost.com/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .article-box',
      articleLink: 'h2 a, h3 a, .title a, a[href*="/news/"]',
      articleTitle: 'h2, h3, .title, .post-title',
      articleDescription: '.excerpt, .summary, .post-excerpt, p:first-of-type',
      articleDate: '.date, .post-date, time',
      articleAuthor: '.author, .by-author',
      articleImage: '.featured-image img, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://indonesiabusinesspost.com',
    maxArticles: 20,
    active: true  // Enabled - 18 articles scraped successfully
  },
  {
    name: 'Geopolstratindo',
    url: 'https://geopolstratindo.com/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .article-preview',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .article-title',
      articleDescription: '.excerpt, .summary, .content-preview, p:first-of-type',
      articleDate: '.date, .publish-date, time',
      articleAuthor: '.author, .writer',
      articleImage: 'img:first-of-type, .featured img, .thumbnail img'
    },
    baseUrl: 'https://geopolstratindo.com',
    maxArticles: 15,
    active: false
  },
  {
    name: 'Journal NEO',
    url: 'https://journal-neo.su/',
    category: 'BRICS',
    selectors: {
      articleList: '.category-posts-container',
      articleLink: 'a',
      articleTitle: 'h3, .category-posts-title',
      articleDescription: '.category-posts-excerpt, p:first-of-type',
      articleDate: '.category-posts-date, time',
      articleAuthor: '.category-posts-author',
      articleImage: '.category-posts-thumbnail img'
    },
    baseUrl: 'https://journal-neo.su',
    maxArticles: 20,
    active: false  // Needs testing with new selectors
  },
  {
    name: 'John Helmer',
    url: 'https://johnhelmer.net/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .entry',
      articleLink: 'h2 a, .entry-title a',
      articleTitle: 'h2, .entry-title',
      articleDescription: '.entry-content p:first-of-type, .excerpt',
      articleDate: '.entry-date, .published, time',
      articleAuthor: '.author, .by-author',
      articleImage: '.wp-post-image, img:first-of-type'
    },
    baseUrl: 'https://johnhelmer.net',
    maxArticles: 15,
    active: true  // Enabled - 8 articles scraped successfully
  },
  // New scraper configs for failed RSS sources
  {
    name: 'Tempo News (Scraper)',
    url: 'https://www.tempo.co/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .card',
      articleLink: 'a[href*="/read/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .card__title',
      articleDescription: '.excerpt, .summary, .card__excerpt, p:first-of-type',
      articleDate: 'time, .date, .published, .card__meta time',
      articleAuthor: '.author, .by-author, .card__author',
      articleImage: 'img:first-of-type, .card__image img, .featured-image img'
    },
    baseUrl: 'https://www.tempo.co',
    maxArticles: 25,
    active: true  // Enable scraping for Tempo since RSS is blocked
  },
  {
    name: 'Kompas News (Scraper)',
    url: 'https://www.kompas.com/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .article__list, .most-popular__item, .latest__item',
      articleLink: 'a[href*="/read/"], .article__link, h3 a, .most-popular__link',
      articleTitle: 'h3, .article__title, .most-popular__title, .latest__title',
      articleDescription: '.article__lead, .article__subtitle, .summary',
      articleDate: 'time, .article__date, .most-popular__date',
      articleAuthor: '.article__author, .author',
      articleImage: '.article__asset img, .most-popular__asset img, img:first-of-type'
    },
    baseUrl: 'https://www.kompas.com',
    maxArticles: 25,
    active: true  // Enable scraping for Kompas since RSS is broken
  },
  {
    name: 'SCMP China (Scraper)',
    url: 'https://www.scmp.com/news/china',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .story, .story-item, .article-item',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .story__headline a',
      articleTitle: 'h2, h3, .story__headline, .article__headline',
      articleDescription: '.story__summary, .article__summary, .summary, p:first-of-type',
      articleDate: 'time, .story__time, .article__time, .published',
      articleAuthor: '.story__author, .article__author, .author',
      articleImage: '.story__image img, .article__image img, img:first-of-type'
    },
    baseUrl: 'https://www.scmp.com',
    maxArticles: 20,
    active: true  // Enable scraping for SCMP since RSS is malformed
  },
  {
    name: 'SCMP Asia (Scraper)',
    url: 'https://www.scmp.com/news/asia',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .story, .story-item, .article-item',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .story__headline a',
      articleTitle: 'h2, h3, .story__headline, .article__headline',
      articleDescription: '.story__summary, .article__summary, .summary, p:first-of-type',
      articleDate: 'time, .story__time, .article__time, .published',
      articleAuthor: '.story__author, .article__author, .author',
      articleImage: '.story__image img, .article__image img, img:first-of-type'
    },
    baseUrl: 'https://www.scmp.com',
    maxArticles: 20,
    active: true  // Enable scraping for SCMP Asia since RSS is malformed
  },
  {
    name: 'Antara News (Scraper)',
    url: 'https://www.antaranews.com/berita/terkini',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .article-item, .simple-post, .post',
      articleLink: 'a[href*="/berita/"], h2 a, h3 a, .article-title a',
      articleTitle: 'h2, h3, .article-title, .post-title',
      articleDescription: '.article-content, .post-excerpt, .summary, p:first-of-type',
      articleDate: 'time, .article-date, .post-date, .published',
      articleAuthor: '.article-author, .author, .by-author',
      articleImage: '.article-image img, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://www.antaranews.com',
    maxArticles: 25,
    active: true  // Enable scraping for Antara News since RSS parsing fails
  },
  {
    name: 'BBC Asia News (Scraper)', 
    url: 'https://www.bbc.com/news/world/asia',
    category: 'BRICS',
    selectors: {
      articleList: '[data-testid="edinburgh-article"], .gs-c-promo, .media__content',
      articleLink: 'a[href*="/news/"], .gs-c-promo-heading a, .media__link',
      articleTitle: '.gs-c-promo-heading__title, .media__title, h3',
      articleDescription: '.gs-c-promo-summary, .media__summary, .gs-c-promo__summary',
      articleDate: 'time, [data-testid="card-metadata"], .gs-c-promo-timestamp',
      articleAuthor: '.gs-c-byline, .media__byline',
      articleImage: '.gs-c-promo-image img, .media__image img, img:first-of-type'
    },
    baseUrl: 'https://www.bbc.com',
    maxArticles: 20,
    active: true  // Enable scraping for BBC Asia since RSS parsing fails
  },
  {
    name: 'RT News (Scraper)',
    url: 'https://www.rt.com/',
    category: 'BRICS',
    selectors: {
      articleList: '.card, .card-rows__item, .main-promos__item',
      articleLink: '.card__heading a, .main-promos__link, a[href*="/news/"]',
      articleTitle: '.card__heading, .main-promos__title, h3',
      articleDescription: '.card__summary, .main-promos__summary, .card__text',
      articleDate: '.card__date, .main-promos__date, time',
      articleAuthor: '.card__author, .author',
      articleImage: '.card__media img, .main-promos__media img, img:first-of-type'
    },
    baseUrl: 'https://www.rt.com',
    maxArticles: 25,
    active: true  // Enable scraping for RT since RSS parsing fails
  },
  {
    name: 'Al Jazeera (Scraper)',
    url: 'https://www.aljazeera.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .gc, .topics-sec-item, .featured-articles-list__item',
      articleLink: 'a[href*="/news/"], .gc__link, .topics-sec-item__link, h3 a',
      articleTitle: 'h3, .gc__title, .topics-sec-item__title, .featured-articles-list__item__title',
      articleDescription: '.gc__excerpt, .topics-sec-item__summary, .featured-articles-list__item__excerpt',
      articleDate: 'time, .gc__date, .topics-sec-item__date, .screen-reader-text',
      articleAuthor: '.gc__author, .author',
      articleImage: '.gc__image img, .topics-sec-item__image img, img:first-of-type'
    },
    baseUrl: 'https://www.aljazeera.com',
    maxArticles: 20,
    active: true  // Enable scraping for Al Jazeera since RSS parsing fails
  },
  // New geopolitical analysis sources
  {
    name: 'UN News (Scraper)',
    url: 'https://news.un.org/en/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .story, .news-item',
      articleLink: 'a.story-link, h2 a, h3 a',
      articleTitle: 'h2, h3, .story-headline',
      articleDescription: '.story-teaser, .summary, p:first-of-type',
      articleDate: 'time, .date, .story-date',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .story-image img'
    },
    baseUrl: 'https://news.un.org',
    maxArticles: 25,
    active: true
  },
  {
    name: 'The Diplomat (Scraper)',
    url: 'https://thediplomat.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .td-block-span12',
      articleLink: 'a.td-image-wrap, h3 a, .entry-title a',
      articleTitle: 'h3, .entry-title, .td-module-title',
      articleDescription: '.td-excerpt, .entry-summary, p:first-of-type',
      articleDate: 'time, .td-post-date, .entry-date',
      articleAuthor: '.td-post-author-name, .author',
      articleImage: '.td-module-thumb img, .entry-thumb img, img:first-of-type'
    },
    baseUrl: 'https://thediplomat.com',
    maxArticles: 25,
    active: true
  },
  {
    name: 'Global Issues (Scraper)',
    url: 'https://www.globalissues.org/news',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .news-item, .story',
      articleLink: 'h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title',
      articleDescription: '.excerpt, .summary, p:first-of-type',
      articleDate: 'time, .date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .featured-image img'
    },
    baseUrl: 'https://www.globalissues.org',
    maxArticles: 20,
    active: true
  },
  {
    name: 'E-International Relations (Scraper)',
    url: 'https://www.e-ir.info/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .article-item',
      articleLink: 'h2 a, h3 a, .entry-title a',
      articleTitle: 'h2, h3, .entry-title',
      articleDescription: '.entry-summary, .excerpt, p:first-of-type',
      articleDate: 'time, .entry-date, .published',
      articleAuthor: '.author, .entry-author',
      articleImage: '.wp-post-image, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://www.e-ir.info',
    maxArticles: 25,
    active: true
  },
  {
    name: 'Foreign Affairs (Scraper)',
    url: 'https://www.foreignaffairs.com/topics/geopolitics',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .article-item, .promo',
      articleLink: 'a.article-link, h2 a, h3 a',
      articleTitle: 'h2, h3, .article-title',
      articleDescription: '.article-dek, .summary, p:first-of-type',
      articleDate: 'time, .article-date, .published',
      articleAuthor: '.article-author, .author',
      articleImage: 'img:first-of-type, .article-image img'
    },
    baseUrl: 'https://www.foreignaffairs.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Geopolitical Economy (Scraper)',
    url: 'https://geopoliticaleconomy.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .article-item',
      articleLink: 'h2 a, .entry-title a',
      articleTitle: 'h2, .entry-title',
      articleDescription: '.entry-summary, .excerpt, p:first-of-type',
      articleDate: 'time, .entry-date, .published',
      articleAuthor: '.author, .entry-author',
      articleImage: '.wp-post-image, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://geopoliticaleconomy.com',
    maxArticles: 25,
    active: true
  },
  {
    name: 'Financial Times Geopolitics (Scraper)',
    url: 'https://www.ft.com/geopolitics',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .o-teaser, .story',
      articleLink: 'a.js-teaser-heading-link, h2 a, .o-teaser__heading a',
      articleTitle: 'h2, .o-teaser__heading',
      articleDescription: '.o-teaser__standfirst, .summary, p:first-of-type',
      articleDate: 'time, .o-teaser__timestamp, .article-date',
      articleAuthor: '.o-teaser__byline, .author',
      articleImage: 'img:first-of-type, .o-teaser__image img'
    },
    baseUrl: 'https://www.ft.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'RAND Corporation (Scraper)',
    url: 'https://www.rand.org/topics/international-affairs.html',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .product-main, .product-listing',
      articleLink: 'a.product-link, h3 a, h2 a',
      articleTitle: 'h3, h2, .product-title',
      articleDescription: '.product-desc, .summary, p:first-of-type',
      articleDate: 'time, .product-date, .date',
      articleAuthor: '.product-authors, .author',
      articleImage: 'img:first-of-type, .product-image img'
    },
    baseUrl: 'https://www.rand.org',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Geopolitical Futures (Scraper)',
    url: 'https://geopoliticalfutures.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .vp-portfolio__item',
      articleLink: 'a.vp-portfolio__item-img, h2 a, h3 a',
      articleTitle: 'h2, h3, .vp-portfolio__item-title',
      articleDescription: '.vp-portfolio__item-excerpt, .excerpt, p:first-of-type',
      articleDate: 'time, .vp-portfolio__item-meta-date, .date',
      articleAuthor: '.vp-portfolio__item-meta-author, .author',
      articleImage: 'img:first-of-type, .vp-portfolio__item-img img'
    },
    baseUrl: 'https://geopoliticalfutures.com',
    maxArticles: 25,
    active: true
  },
  {
    name: 'Fifty Year Perspective (Scraper)',
    url: 'https://fiftyyearperspective.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .entry',
      articleLink: 'h2 a, .entry-title a',
      articleTitle: 'h2, .entry-title',
      articleDescription: '.entry-summary, .excerpt, p:first-of-type',
      articleDate: 'time, .entry-date, .published',
      articleAuthor: '.author, .entry-author',
      articleImage: '.wp-post-image, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://fiftyyearperspective.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Eclinik WordPress',
    url: 'https://eclinik.wordpress.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .entry',
      articleLink: 'h2 a, .entry-title a',
      articleTitle: 'h2, .entry-title',
      articleDescription: '.entry-summary, .excerpt, p:first-of-type',
      articleDate: 'time, .entry-date, .published',
      articleAuthor: '.author, .entry-author',
      articleImage: '.wp-post-image, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://eclinik.wordpress.com',
    maxArticles: 20,
    active: true
  },
  // Scraper configs for newly re-enabled RSS sources
  {
    name: 'Press TV (Scraper)',
    url: 'https://www.presstv.ir/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .news-item, .story-item',
      articleLink: 'a[href*="/Detail/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.summary, .excerpt, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .story-image img, .featured-image img'
    },
    baseUrl: 'https://www.presstv.ir',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Global Times (Scraper)',
    url: 'https://www.globaltimes.cn/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .news-item, .story-box',
      articleLink: 'a[href*="/content/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.summary, .excerpt, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-time, .publish-time',
      articleAuthor: '.author, .byline, .source',
      articleImage: 'img:first-of-type, .story-img img, .news-img img'
    },
    baseUrl: 'https://www.globaltimes.cn',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Jakarta Globe (Scraper)',
    url: 'https://jakartaglobe.id/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .story-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.excerpt, .summary, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-date, .published',
      articleAuthor: '.author, .byline, .writer',
      articleImage: 'img:first-of-type, .story-image img, .featured-image img'
    },
    baseUrl: 'https://jakartaglobe.id',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Jakarta Post (Scraper)',
    url: 'https://www.thejakartapost.com/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .story-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.excerpt, .summary, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-date, .published',
      articleAuthor: '.author, .byline, .writer',
      articleImage: 'img:first-of-type, .story-image img, .featured-image img'
    },
    baseUrl: 'https://www.thejakartapost.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Bali Post (Scraper)',
    url: 'https://www.balipost.com/',
    category: 'Bali',
    selectors: {
      articleList: 'article, .post, .news-item, .story-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.excerpt, .summary, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-date, .published',
      articleAuthor: '.author, .byline, .writer',
      articleImage: 'img:first-of-type, .story-image img, .featured-image img'
    },
    baseUrl: 'https://www.balipost.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'NDTV World (Scraper)',
    url: 'https://www.ndtv.com/world-news',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .news-item, .story-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.excerpt, .summary, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .story-image img, .featured-image img'
    },
    baseUrl: 'https://www.ndtv.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'NDTV Business (Scraper)',
    url: 'https://www.ndtv.com/business',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .news-item, .story-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .story-title',
      articleDescription: '.excerpt, .summary, .story-summary, p:first-of-type',
      articleDate: 'time, .date, .story-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .story-image img, .featured-image img'
    },
    baseUrl: 'https://www.ndtv.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'South China Morning Post - Business (Scraper)',
    url: 'https://www.scmp.com/business',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .story, .story-item, .article-item',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .story__headline a',
      articleTitle: 'h2, h3, .story__headline, .article__headline',
      articleDescription: '.story__summary, .article__summary, .summary, p:first-of-type',
      articleDate: 'time, .story__time, .article__time, .published',
      articleAuthor: '.story__author, .article__author, .author',
      articleImage: '.story__image img, .article__image img, img:first-of-type'
    },
    baseUrl: 'https://www.scmp.com',
    maxArticles: 20,
    active: true
  },
  // BRICS Organizations Scraper Configurations
  {
    name: 'InfoBRICS (Scraper)',
    url: 'https://infobrics.org/',
    category: 'BRICS',
    selectors: {
      articleList: '.post, .news-item, article, .entry',
      articleLink: 'a[href*="/post/"], h2 a, h3 a, .entry-title a',
      articleTitle: 'h2, h3, .entry-title, .post-title',
      articleDescription: '.entry-summary, .excerpt, .summary, p:first-of-type',
      articleDate: 'time, .entry-date, .post-date, .published',
      articleAuthor: '.author, .entry-author',
      articleImage: '.entry-thumbnail img, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://infobrics.org',
    maxArticles: 25,
    active: true
  },
  {
    name: 'BRICS Policy Center (Scraper)',
    url: 'https://bricspolicycenter.org/en/',
    category: 'BRICS',
    selectors: {
      articleList: '.post, .news-item, article, .entry',
      articleLink: 'a[href*="/homepagepost/"], h2 a, h3 a, .entry-title a',
      articleTitle: 'h2, h3, .entry-title, .post-title',
      articleDescription: '.entry-summary, .excerpt, .summary, p:first-of-type',
      articleDate: 'time, .entry-date, .post-date, .published',
      articleAuthor: '.author, .entry-author',
      articleImage: '.entry-thumbnail img, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://bricspolicycenter.org',
    maxArticles: 20,
    active: true
  },
  {
    name: 'TV BRICS (Scraper)',
    url: 'https://tvbrics.com/en/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .story-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .news-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .news-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .news-image img, .featured-image img'
    },
    baseUrl: 'https://tvbrics.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'BRICS Business Council India (Scraper)',
    url: 'https://bricsbusinesscouncil.co.in/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .announcement',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .news-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .news-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .news-image img, .featured-image img'
    },
    baseUrl: 'https://bricsbusinesscouncil.co.in',
    maxArticles: 15,
    active: true
  },
  {
    name: 'SA BRICS Business Council (Scraper)',
    url: 'https://sabricsbusinesscouncil.co.za/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .media-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .media-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .media-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .media-image img, .featured-image img'
    },
    baseUrl: 'https://sabricsbusinesscouncil.co.za',
    maxArticles: 15,
    active: true
  },
  {
    name: 'BRICS Chamber of Commerce (Scraper)',
    url: 'https://bricscci.com/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .event-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .event-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .event-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .event-image img, .featured-image img'
    },
    baseUrl: 'https://bricscci.com',
    maxArticles: 15,
    active: true
  },
  {
    name: 'Shanghai Cooperation Organisation (Scraper)',
    url: 'https://eng.sectsco.org/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .event-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .news-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .news-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .news-image img, .featured-image img'
    },
    baseUrl: 'https://eng.sectsco.org',
    maxArticles: 20,
    active: true
  },
  {
    name: 'Valdai Discussion Club (Scraper)',
    url: 'https://valdaiclub.com/',
    category: 'BRICS',
    selectors: {
      articleList: '.post, .article, .news-item, .opinion-item',
      articleLink: 'a[href*="/a/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .article-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .article-date, .published',
      articleAuthor: '.author, .byline, .article-author',
      articleImage: 'img:first-of-type, .article-image img, .featured-image img'
    },
    baseUrl: 'https://valdaiclub.com',
    maxArticles: 20,
    active: true
  },
  {
    name: 'BRICS Universities Association (Scraper)',
    url: 'https://brics.world/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .update-item',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .update-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .update-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .update-image img, .featured-image img'
    },
    baseUrl: 'https://brics.world',
    maxArticles: 15,
    active: true
  },
  {
    name: 'BRICS Brasil (Scraper)',
    url: 'https://brics.br/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .noticia',
      articleLink: 'a[href*="/noticia/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .noticia-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .noticia-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .noticia-image img, .featured-image img'
    },
    baseUrl: 'https://brics.br',
    maxArticles: 20,
    active: true
  },
  {
    name: 'BRICS University of Toronto (Scraper)',
    url: 'http://brics.utoronto.ca/',
    category: 'BRICS',
    selectors: {
      articleList: '.news-item, .post, article, .update',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .update-title',
      articleDescription: '.excerpt, .summary, .description, p:first-of-type',
      articleDate: 'time, .date, .update-date, .published',
      articleAuthor: '.author, .byline',
      articleImage: 'img:first-of-type, .update-image img, .featured-image img'
    },
    baseUrl: 'http://brics.utoronto.ca',
    maxArticles: 15,
    active: true
  },
  {
    name: 'SouthFront (Scraper)',
    url: 'https://southfront.press/',
    category: 'BRICS',
    selectors: {
      articleList: '.post, article, .entry, .news-item',
      articleLink: 'h2 a, h3 a, .entry-title a, .post-title a',
      articleTitle: 'h2, h3, .entry-title, .post-title',
      articleDescription: '.entry-excerpt, .post-excerpt, .summary, .post-content p:first-of-type',
      articleDate: '.entry-date, .post-date, time, .date',
      articleAuthor: '.author, .byline, .entry-author',
      articleImage: '.post-thumbnail img, .entry-image img, .featured-image img, img:first-of-type'
    },
    baseUrl: 'https://southfront.press',
    maxArticles: 20,
    active: true
  },
];

class WebScraper {
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  /**
   * Scrape articles from a single source
   */
  async scrapeSource(config: ScraperConfig): Promise<Article[]> {
    if (!config.active) {
      console.log(`⏭️ Skipping inactive scraper: ${config.name}`);
      return [];
    }

    try {
      console.log(`🕷️ Scraping ${config.name}...`);
      
      // Fetch the webpage
      const response = await axios.get(config.url, {
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5,
      });

      // Parse HTML with Cheerio
      const $ = cheerio.load(response.data);
      const articles: Article[] = [];

      // Find all article containers
      const articleElements = $(config.selectors.articleList).slice(0, config.maxArticles || 20);

      articleElements.each((index, element) => {
        try {
          const $article = $(element);
          
          // Extract article link
          const linkElement = $article.find(config.selectors.articleLink).first();
          let link = linkElement.attr('href') || '';
          
          // Make relative URLs absolute
          if (link && !link.startsWith('http')) {
            link = new URL(link, config.baseUrl || config.url).toString();
          }

          // Extract title
          const title = $article.find(config.selectors.articleTitle).first().text().trim() || 
                       linkElement.text().trim() || 
                       'No title';

          // Extract description
          let description = '';
          if (config.selectors.articleDescription) {
            description = $article.find(config.selectors.articleDescription).first().text().trim();
          }
          
          // Clean up description
          description = this.cleanText(description).substring(0, 200);
          if (!description) {
            description = title; // Fallback to title if no description
          }

          // Extract date
          let pubDate = new Date().toISOString();
          if (config.selectors.articleDate) {
            const dateText = $article.find(config.selectors.articleDate).first().text().trim();
            const dateAttr = $article.find(config.selectors.articleDate).first().attr('datetime');
            
            if (dateAttr) {
              pubDate = new Date(dateAttr).toISOString();
            } else if (dateText) {
              const parsedDate = this.parseDate(dateText);
              if (parsedDate) {
                pubDate = parsedDate.toISOString();
              }
            }
          }

          // Extract author
          let author = undefined;
          if (config.selectors.articleAuthor) {
            author = $article.find(config.selectors.articleAuthor).first().text().trim();
          }

          // Extract image
          let imageUrl = undefined;
          if (config.selectors.articleImage) {
            const imgElement = $article.find(config.selectors.articleImage).first();
            imageUrl = imgElement.attr('src') || imgElement.attr('data-src');
            
            // Make relative image URLs absolute
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = new URL(imageUrl, config.baseUrl || config.url).toString();
            }
          }

          // Only add if we have at least a link and title
          if (link && title && title !== 'No title') {
            const article: Article = {
              id: `${config.name.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
              title: this.cleanText(title),
              link,
              description,
              pubDate,
              author,
              category: config.category,
              source: config.name,
              sourceUrl: config.url,
              imageUrl,
            };

            articles.push(article);
          }
        } catch (error) {
          console.error(`Failed to parse article ${index} from ${config.name}:`, error);
        }
      });

      console.log(`✅ Scraped ${articles.length} articles from ${config.name}`);
      return articles;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(`❌ HTTP ${error.response.status} from ${config.name}: ${error.response.statusText}`);
        } else if (error.request) {
          console.log(`❌ No response from ${config.name} - site may be down`);
        } else {
          console.log(`❌ Request setup error for ${config.name}:`, error.message);
        }
      } else {
        console.log(`❌ Failed to scrape ${config.name}`);
      }
      return [];
    }
  }

  /**
   * Scrape all active sources
   */
  async scrapeAllSources(): Promise<Article[]> {
    const activeSources = SCRAPER_SOURCES.filter(source => source.active);
    
    if (activeSources.length === 0) {
      console.log('ℹ️ No active scraper sources configured');
      return [];
    }

    console.log(`🕷️ Scraping ${activeSources.length} websites...`);
    
    const promises = activeSources.map(source => this.scrapeSource(source));
    const results = await Promise.allSettled(promises);
    
    const allArticles: Article[] = [];
    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
        if (result.value.length > 0) {
          successCount++;
        }
      } else {
        failureCount++;
        console.error(`Failed to scrape ${activeSources[index].name}:`, result.reason);
      }
    });

    console.log(`📊 Scraping complete: ${successCount} succeeded, ${failureCount} failed, ${allArticles.length} total articles`);
    
    // Sort by publication date (newest first)
    return allArticles.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  /**
   * Scrape articles by category
   */
  async scrapeByCategory(category: 'BRICS' | 'Indonesia' | 'Bali'): Promise<Article[]> {
    const categorySources = SCRAPER_SOURCES.filter(
      source => source.category === category && source.active
    );
    
    if (categorySources.length === 0) {
      console.log(`ℹ️ No active scraper sources for category: ${category}`);
      return [];
    }

    const promises = categorySources.map(source => this.scrapeSource(source));
    const results = await Promise.allSettled(promises);
    
    const articles: Article[] = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    });

    return articles.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  /**
   * Scrape articles by source name (for RSS fallback)
   */
  async scrapeBySourceName(sourceName: string): Promise<Article[]> {
    // Map RSS source names to scraper equivalents
    const sourceMapping: { [key: string]: string } = {
      // Original scraper mappings
      'Tempo News': 'Tempo News (Scraper)',
      'Kompas News': 'Kompas News (Scraper)',
      'South China Morning Post - China': 'SCMP China (Scraper)',
      'South China Morning Post - Asia': 'SCMP Asia (Scraper)',
      'Antara News': 'Antara News (Scraper)',
      'BBC Asia News': 'BBC Asia News (Scraper)',
      'RT News': 'RT News (Scraper)',
      'Al Jazeera': 'Al Jazeera (Scraper)',
      // Newly re-enabled RSS sources with backup scrapers
      'Press TV': 'Press TV (Scraper)',
      'Global Times': 'Global Times (Scraper)',
      'Jakarta Globe': 'Jakarta Globe (Scraper)',
      'Jakarta Post': 'Jakarta Post (Scraper)',
      'Bali Post': 'Bali Post (Scraper)',
      'Indonesia Business Post': 'Indonesia Business Post', // Already has active scraper
      'NDTV World': 'NDTV World (Scraper)',
      'NDTV Business': 'NDTV Business (Scraper)',
      'South China Morning Post - Business': 'South China Morning Post - Business (Scraper)',
      // Geopolitical sources (existing)
      'UN News': 'UN News (Scraper)',
      'The Diplomat': 'The Diplomat (Scraper)',
      'Global Issues': 'Global Issues (Scraper)',
      'E-International Relations': 'E-International Relations (Scraper)',
      'Foreign Affairs Geopolitics': 'Foreign Affairs (Scraper)',
      'Geopolitical Economy': 'Geopolitical Economy (Scraper)',
      'Financial Times Geopolitics': 'Financial Times Geopolitics (Scraper)',
      'RAND International Affairs': 'RAND Corporation (Scraper)',
      'Geopolitical Futures': 'Geopolitical Futures (Scraper)',
      'Fifty Year Perspective': 'Fifty Year Perspective (Scraper)',
      'Eclinik WordPress': 'Eclinik WordPress (Scraper)',
      // BRICS Organizations RSS-to-Scraper mappings
      'InfoBRICS': 'InfoBRICS (Scraper)',
      'BRICS Policy Center': 'BRICS Policy Center (Scraper)',
      'TV BRICS': 'TV BRICS (Scraper)',
      'BRICS Business Council India': 'BRICS Business Council India (Scraper)',
      'SA BRICS Business Council': 'SA BRICS Business Council (Scraper)',
      'BRICS Chamber of Commerce': 'BRICS Chamber of Commerce (Scraper)',
      'Shanghai Cooperation Organisation': 'Shanghai Cooperation Organisation (Scraper)',
      'Valdai Discussion Club': 'Valdai Discussion Club (Scraper)',
      'BRICS Universities Association': 'BRICS Universities Association (Scraper)',
      'BRICS Brasil': 'BRICS Brasil (Scraper)',
      'BRICS University of Toronto': 'BRICS University of Toronto (Scraper)',
      'SouthFront': 'SouthFront (Scraper)',
    };
    
    // Try direct name first, then mapped name
    const scraperName = sourceMapping[sourceName] || sourceName;
    
    const source = SCRAPER_SOURCES.find(
      s => s.name === scraperName || s.name === sourceName
    );
    
    if (!source) {
      console.log(`ℹ️ No scraper configuration found for: ${sourceName}`);
      return [];
    }
    
    if (!source.active) {
      console.log(`ℹ️ Scraper for ${sourceName} is disabled`);
      return [];
    }
    
    console.log(`🕷️ Scraping fallback for ${sourceName} using config: ${source.name}`);
    return await this.scrapeSource(source);
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\n+/g, ' ')           // Remove newlines
      .replace(/\t+/g, ' ')           // Remove tabs
      .replace(/[^\S\r\n]+/g, ' ')    // Remove extra spaces
      .trim();
  }

  /**
   * Parse various date formats
   */
  private parseDate(dateStr: string): Date | null {
    // Try to parse the date string
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try parsing relative dates like "2 hours ago", "yesterday"
    const lowerDate = dateStr.toLowerCase();
    const now = new Date();

    if (lowerDate.includes('ago')) {
      const match = lowerDate.match(/(\d+)\s*(minute|hour|day|week|month)s?\s*ago/);
      if (match) {
        const [, amount, unit] = match;
        const value = parseInt(amount);
        
        switch (unit) {
          case 'minute':
            now.setMinutes(now.getMinutes() - value);
            break;
          case 'hour':
            now.setHours(now.getHours() - value);
            break;
          case 'day':
            now.setDate(now.getDate() - value);
            break;
          case 'week':
            now.setDate(now.getDate() - (value * 7));
            break;
          case 'month':
            now.setMonth(now.getMonth() - value);
            break;
        }
        
        return now;
      }
    }

    if (lowerDate === 'today') {
      return now;
    }

    if (lowerDate === 'yesterday') {
      now.setDate(now.getDate() - 1);
      return now;
    }

    return null;
  }

  /**
   * Test a scraper configuration
   */
  async testScraper(sourceName: string): Promise<void> {
    const source = SCRAPER_SOURCES.find(s => s.name === sourceName);
    
    if (!source) {
      console.error(`❌ Scraper source not found: ${sourceName}`);
      return;
    }

    // Temporarily enable for testing
    const originalActive = source.active;
    source.active = true;

    console.log(`\n🧪 Testing scraper: ${sourceName}`);
    console.log(`📍 URL: ${source.url}`);
    console.log(`🏷️ Category: ${source.category}`);
    console.log(`🔍 Selectors:`, source.selectors);

    const articles = await this.scrapeSource(source);
    
    if (articles.length > 0) {
      console.log(`\n✅ Successfully scraped ${articles.length} articles!`);
      console.log('\n📰 Sample article:');
      console.log('  Title:', articles[0].title);
      console.log('  Link:', articles[0].link);
      console.log('  Description:', articles[0].description.substring(0, 100) + '...');
      console.log('  Date:', articles[0].pubDate);
      console.log('  Image:', articles[0].imageUrl || 'None');
    } else {
      console.log('\n❌ No articles scraped. Check selectors and site structure.');
    }

    // Restore original state
    source.active = originalActive;
  }
}

// Export singleton instance
export const webScraper = new WebScraper();

// Export class for custom instances
export { WebScraper };