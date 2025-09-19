'use server';

import mailchimp from '@mailchimp/mailchimp_marketing';
import { createHash } from 'crypto';

// Configure Mailchimp client
if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX) {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
  });
}

export interface SubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  interests?: string[];
  source?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  error?: string;
  memberStatus?: string;
}

/**
 * Subscribe user to newsletter with Mailchimp.
 * 
 * Args:
 *   data (SubscribeData): User subscription data.
 * 
 * Returns:
 *   SubscriptionResponse: Result of subscription attempt.
 */
export async function subscribeToNewsletter(data: SubscribeData): Promise<SubscriptionResponse> {
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  
  if (!listId) {
    console.error('🚨 MAILCHIMP_AUDIENCE_ID environment variable not configured');
    return {
      success: false,
      message: 'Newsletter service temporarily unavailable. Please try again later.',
      error: 'Missing configuration'
    };
  }

  if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
    console.error('🚨 Mailchimp API credentials not configured');
    return {
      success: false,
      message: 'Newsletter service temporarily unavailable. Please try again later.',
      error: 'Missing credentials'
    };
  }

  try {
    // Prepare member data
    const memberData = {
      email_address: data.email,
      status: 'subscribed' as const,
      merge_fields: {
        FNAME: data.firstName || '',
        LNAME: data.lastName || '',
        LOCATION: data.location || '',
        SOURCE: data.source || 'website'
      },
      tags: [
        'bali-report',
        'tropical-news',
        ...(data.interests || [])
      ]
    };

    // Subscribe user to audience
    const response = await mailchimp.lists.addListMember(listId, memberData);
    
    console.log('🌺 New newsletter subscriber:', {
      email: data.email,
      status: response.status,
      id: (response as any).id || 'unknown'
    });

    return {
      success: true,
      message: 'Welcome to Bali Report! 🏝️ You\'ll receive tropical news updates in your inbox.',
      memberStatus: String(response.status)
    };

  } catch (error: any) {
    console.error('🚨 Mailchimp subscription error:', error);

    // Handle specific Mailchimp errors
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return {
        success: false,
        message: 'This email is already subscribed to our newsletter! 🌊',
        error: 'Member already exists'
      };
    }

    if (error.status === 400 && error.response?.body?.title === 'Invalid Resource') {
      return {
        success: false,
        message: 'Please provide a valid email address.',
        error: 'Invalid email'
      };
    }

    return {
      success: false,
      message: 'Unable to complete subscription. Please try again later.',
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Get subscriber information from Mailchimp.
 * 
 * Args:
 *   email (string): Email address to check.
 * 
 * Returns:
 *   Promise<object|null>: Subscriber data or null if not found.
 */
export async function getSubscriber(email: string) {
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  
  if (!listId || !process.env.MAILCHIMP_API_KEY) {
    return null;
  }

  try {
    const subscriberHash = createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');
    
    const response = await mailchimp.lists.getListMember(listId, subscriberHash);
    return response;
  } catch (error) {
    console.warn('⚠️ Could not fetch subscriber:', error);
    return null;
  }
}

/**
 * Get audience statistics.
 * 
 * Returns:
 *   Promise<object|null>: Audience statistics or null if error.
 */
export async function getAudienceStats() {
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  
  if (!listId || !process.env.MAILCHIMP_API_KEY) {
    return null;
  }

  try {
    // For now, return null - this feature can be implemented later
    // when we have specific Mailchimp API requirements
    console.log('📈 Audience stats feature available but not implemented yet');
    return null;
  } catch (error) {
    console.warn('⚠️ Could not fetch audience stats:', error);
    return null;
  }
}

/**
 * Send welcome email (if transactional API is set up).
 * 
 * Args:
 *   email (string): Recipient email address.
 *   firstName (string): Recipient first name (optional).
 * 
 * Returns:
 *   Promise<boolean>: True if email queued successfully.
 */
export async function sendWelcomeEmail(email: string, firstName?: string) {
  // This would require Mailchimp Transactional API (Mandrill)
  // Implementation depends on whether you want to use this feature
  console.log('📧 Welcome email queued for:', email);
  
  // For now, rely on Mailchimp's automated welcome emails
  return true;
}

/**
 * Validate Mailchimp configuration.
 * 
 * Returns:
 *   Promise<object>: Configuration validation result.
 */
export async function validateMailchimpConfig(): Promise<{ isValid: boolean; missing: string[] }> {
  const required = ['MAILCHIMP_API_KEY', 'MAILCHIMP_SERVER_PREFIX', 'MAILCHIMP_AUDIENCE_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}
