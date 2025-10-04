import { NewsletterContent, NewsletterSection } from '@/lib/newsletter-automation';

/**
 * Email template service for Bali Report newsletters.
 * Generates responsive HTML email templates with proper email client compatibility.
 */
export class NewsletterTemplates {
  
  /**
   * Generate complete HTML email from newsletter content.
   * 
   * Args:
   *   content (NewsletterContent): Newsletter content structure.
   *   templateType (string): Template variant (daily/weekly/monthly).
   *   
   * Returns:
   *   string: Complete HTML email content.
   */
  static generateHTML(content: NewsletterContent, templateType: 'daily' | 'weekly' | 'monthly' = 'daily'): string {
    const cssStyles = this.getEmailCSS();
    const headerHTML = this.generateHeader(content);
    const sectionsHTML = this.generateSections(content.sections);
    const footerHTML = this.generateFooter();

    return `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="x-apple-disable-message-reformatting">
        <title>${content.title}</title>
        <!--[if mso]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <style type="text/css">
          ${cssStyles}
        </style>
      </head>
      <body class="body" style="margin:0; padding:0; background-color:#f6f6f6; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f6f6f6;">
          <tr>
            <td align="center" style="padding:20px 0;">
              <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin:0 auto; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                ${headerHTML}
                ${sectionsHTML}
                ${footerHTML}
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Tracking pixel for email clients that support it -->
        <img src="*|IMGTRACKING|*" width="1" height="1" border="0" alt="" style="display:block;">
      </body>
      </html>
    `;
  }

  /**
   * Get comprehensive CSS styles optimized for email clients.
   */
  private static getEmailCSS(): string {
    return `
      /* Reset and base styles */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      
      /* Email client specific */
      .email-container { max-width: 600px; margin: 0 auto; }
      
      /* Header styles */
      .header-section {
        background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
        color: #ffffff;
        text-align: center;
        padding: 40px 30px;
        border-radius: 8px 8px 0 0;
      }
      
      .header-title {
        font-size: 28px;
        font-weight: bold;
        margin: 0 0 12px 0;
        line-height: 1.2;
        color: #ffffff;
      }
      
      .header-subtitle {
        font-size: 16px;
        margin: 0;
        opacity: 0.95;
        line-height: 1.4;
        color: #ffffff;
      }
      
      /* Logo and branding */
      .logo-section {
        padding: 20px 30px;
        text-align: center;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .logo-text {
        font-size: 24px;
        font-weight: bold;
        color: #14b8a6;
        text-decoration: none;
        margin: 0;
      }
      
      .tagline {
        font-size: 12px;
        color: #64748b;
        margin: 5px 0 0 0;
      }
      
      /* Content sections */
      .content-section {
        padding: 30px;
      }
      
      .section-title {
        font-size: 20px;
        font-weight: bold;
        color: #14b8a6;
        margin: 0 0 20px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #14b8a6;
        line-height: 1.3;
      }
      
      /* Featured article */
      .featured-article {
        background-color: #f8fafc;
        border-left: 4px solid #14b8a6;
        border-radius: 6px;
        padding: 25px;
        margin: 0 0 30px 0;
      }
      
      .featured-title {
        font-size: 18px;
        font-weight: bold;
        color: #1e293b;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }
      
      .featured-title a {
        color: #1e293b;
        text-decoration: none;
      }
      
      .featured-title a:hover {
        color: #14b8a6;
        text-decoration: underline;
      }
      
      .featured-description {
        font-size: 15px;
        color: #475569;
        line-height: 1.6;
        margin: 0 0 12px 0;
      }
      
      .featured-meta {
        font-size: 12px;
        color: #94a3b8;
        margin: 0;
      }
      
      /* Regular articles */
      .article-item {
        border-bottom: 1px solid #e2e8f0;
        padding: 20px 0;
      }
      
      .article-item:last-child {
        border-bottom: none;
      }
      
      .article-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 8px 0;
        line-height: 1.4;
      }
      
      .article-title a {
        color: #1e293b;
        text-decoration: none;
      }
      
      .article-title a:hover {
        color: #14b8a6;
        text-decoration: underline;
      }
      
      .article-description {
        font-size: 14px;
        color: #64748b;
        line-height: 1.5;
        margin: 0 0 8px 0;
      }
      
      .article-meta {
        font-size: 12px;
        color: #94a3b8;
        margin: 0;
      }
      
      /* CTA buttons */
      .cta-button {
        display: inline-block;
        background-color: #14b8a6;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        margin: 15px 0;
        text-align: center;
      }
      
      .cta-button:hover {
        background-color: #0d9488;
        color: #ffffff;
        text-decoration: none;
      }
      
      /* Footer */
      .footer-section {
        background-color: #f8fafc;
        padding: 30px;
        text-align: center;
        border-top: 2px solid #e2e8f0;
        border-radius: 0 0 8px 8px;
      }
      
      .footer-content {
        font-size: 14px;
        color: #64748b;
        line-height: 1.6;
        margin: 0 0 20px 0;
      }
      
      .footer-links {
        margin: 15px 0;
      }
      
      .footer-links a {
        color: #14b8a6;
        text-decoration: none;
        margin: 0 8px;
        font-size: 14px;
      }
      
      .footer-links a:hover {
        text-decoration: underline;
      }
      
      .footer-legal {
        font-size: 12px;
        color: #94a3b8;
        margin: 15px 0 0 0;
        line-height: 1.4;
      }
      
      /* Social media icons */
      .social-icons {
        margin: 20px 0;
      }
      
      .social-icon {
        display: inline-block;
        margin: 0 5px;
        text-decoration: none;
      }
      
      /* Mobile responsive */
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          min-width: 100% !important;
        }
        
        .content-section {
          padding: 20px !important;
        }
        
        .header-section {
          padding: 30px 20px !important;
        }
        
        .header-title {
          font-size: 24px !important;
        }
        
        .featured-article {
          padding: 20px !important;
        }
        
        .section-title {
          font-size: 18px !important;
        }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .email-container {
          background-color: #1a202c !important;
        }
        
        .content-section {
          background-color: #1a202c !important;
          color: #e2e8f0 !important;
        }
        
        .article-title {
          color: #e2e8f0 !important;
        }
        
        .article-title a {
          color: #e2e8f0 !important;
        }
        
        .featured-title {
          color: #e2e8f0 !important;
        }
        
        .featured-title a {
          color: #e2e8f0 !important;
        }
        
        .featured-article {
          background-color: #2d3748 !important;
        }
      }
      
      /* Outlook specific */
      <!--[if mso]>
      .header-section {
        background: #14b8a6 !important;
      }
      <![endif]-->
    `;
  }

  /**
   * Generate email header section.
   */
  private static generateHeader(content: NewsletterContent): string {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <tr>
        <td class="logo-section">
          <h1 class="logo-text">🏝️ Bali Report</h1>
          <p class="tagline">Multi-polar news from a tropical perspective</p>
        </td>
      </tr>
      <tr>
        <td class="header-section">
          <h1 class="header-title">${content.title}</h1>
          <p class="header-subtitle">${date}</p>
        </td>
      </tr>
    `;
  }

  /**
   * Generate newsletter content sections.
   */
  private static generateSections(sections: NewsletterSection[]): string {
    return sections
      .filter(section => section.type !== 'header' && section.type !== 'footer')
      .map(section => {
        switch (section.type) {
          case 'featured':
            return this.generateFeaturedSection(section);
          case 'category':
          case 'trending':
            return this.generateArticleSection(section);
          default:
            return '';
        }
      })
      .join('');
  }

  /**
   * Generate featured article section.
   */
  private static generateFeaturedSection(section: NewsletterSection): string {
    if (!section.articles?.[0]) return '';

    const article = section.articles[0];
    const publishDate = new Date(article.pubDate || '').toLocaleDateString();

    return `
      <tr>
        <td class="content-section">
          <h2 class="section-title">${section.title || '🌟 Featured Story'}</h2>
          <div class="featured-article">
            <h3 class="featured-title">
              <a href="${article.url}" target="_blank">${article.title}</a>
            </h3>
            <p class="featured-description">${article.description}</p>
            <p class="featured-meta">
              <strong>${article.source}</strong> • ${publishDate}
            </p>
            <a href="${article.url}" target="_blank" class="cta-button">Read Full Article</a>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Generate regular article section.
   */
  private static generateArticleSection(section: NewsletterSection): string {
    if (!section.articles?.length) return '';

    const articlesHTML = section.articles
      .map(article => {
        const publishDate = new Date(article.pubDate || '').toLocaleDateString();
        const truncatedDescription = article.description.length > 150
          ? article.description.substring(0, 147) + '...'
          : article.description;

        return `
          <div class="article-item">
            <h4 class="article-title">
              <a href="${article.url}" target="_blank">${article.title}</a>
            </h4>
            <p class="article-description">${truncatedDescription}</p>
            <p class="article-meta">
              <strong>${article.source}</strong> • ${publishDate}
            </p>
          </div>
        `;
      })
      .join('');

    return `
      <tr>
        <td class="content-section">
          <h2 class="section-title">${section.title}</h2>
          ${articlesHTML}
        </td>
      </tr>
    `;
  }

  /**
   * Generate email footer section.
   */
  private static generateFooter(): string {
    return `
      <tr>
        <td class="footer-section">
          <p class="footer-content">
            <strong>Thank you for reading Bali Report!</strong><br>
            Stay connected for real-time updates and join our growing community of readers interested in multi-polar perspectives from Southeast Asia.
          </p>
          
          <div class="social-icons">
            <!-- Social media icons would go here -->
          </div>
          
          <div class="footer-links">
            <a href="https://bali.report" target="_blank">Visit Website</a>
            <a href="https://bali.report/campaigns" target="_blank">Support BPD</a>
            <a href="https://bali.report/saved" target="_blank">Reading List</a>
            <a href="*|UNSUB|*" target="_blank">Unsubscribe</a>
          </div>
          
          <p class="footer-legal">
            <strong>Bali Report</strong> - Multi-polar news from a tropical perspective<br>
            Powered by our community and BPD supporters<br>
            <br>
            You received this email because you subscribed to our newsletter.<br>
            <a href="*|UPDATE_PROFILE|*" style="color: #14b8a6;">Update preferences</a> | 
            <a href="*|UNSUB|*" style="color: #94a3b8;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    `;
  }

  /**
   * Generate plain text version for email clients that don't support HTML.
   */
  static generatePlainText(content: NewsletterContent): string {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });

    let text = `BALI REPORT - ${content.title.toUpperCase()}\n`;
    text += `${date}\n`;
    text += `${'='.repeat(60)}\n\n`;

    // Add sections
    content.sections.forEach(section => {
      if (section.type === 'header' || section.type === 'footer') return;

      text += `${(section.title || '').toUpperCase()}\n`;
      text += `${'-'.repeat(section.title?.length || 0)}\n`;

      if (section.articles?.length) {
        section.articles.forEach((article, index) => {
          text += `${index + 1}. ${article.title}\n`;
          text += `   ${article.description.substring(0, 100)}${article.description.length > 100 ? '...' : ''}\n`;
          text += `   Source: ${article.source}\n`;
          text += `   Read more: ${article.url}\n\n`;
        });
      }

      if (section.content) {
        // Strip HTML tags from content
        const cleanContent = section.content.replace(/<[^>]*>/g, '');
        text += `${cleanContent}\n\n`;
      }

      text += '\n';
    });

    // Footer
    text += `${'='.repeat(60)}\n`;
    text += `Thank you for reading Bali Report!\n\n`;
    text += `🌐 Website: https://bali.report\n`;
    text += `💝 Support BPD: https://bali.report/campaigns\n`;
    text += `📚 Reading List: https://bali.report/saved\n`;
    text += `✉️ Unsubscribe: *|UNSUB|*\n\n`;
    text += `Bali Report - Multi-polar news from a tropical perspective\n`;
    text += `Powered by our community and BPD supporters`;

    return text;
  }

  /**
   * Generate preview text for email client inbox display.
   */
  static generatePreviewText(content: NewsletterContent, maxLength: number = 150): string {
    if (content.preheader) {
      return content.preheader.length > maxLength 
        ? content.preheader.substring(0, maxLength - 3) + '...'
        : content.preheader;
    }

    // Generate from first featured article
    const featuredSection = content.sections.find(s => s.type === 'featured');
    if (featuredSection?.articles?.[0]) {
      const article = featuredSection.articles[0];
      const preview = `${article.title} - ${article.description}`;
      return preview.length > maxLength 
        ? preview.substring(0, maxLength - 3) + '...'
        : preview;
    }

    return "Stay updated with the latest multi-polar news and insights from Bali Report.";
  }
}

/**
 * Newsletter template variants for different types.
 */
export const TEMPLATE_VARIANTS = {
  daily: {
    primaryColor: '#14b8a6',
    accentColor: '#06b6d4',
    emoji: '🌅',
    greeting: 'Good morning!'
  },
  weekly: {
    primaryColor: '#0ea5e9',
    accentColor: '#14b8a6',
    emoji: '📊',
    greeting: 'Weekly roundup'
  },
  monthly: {
    primaryColor: '#8b5cf6',
    accentColor: '#14b8a6', 
    emoji: '📅',
    greeting: 'Monthly digest'
  }
} as const;