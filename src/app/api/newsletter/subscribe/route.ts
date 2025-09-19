import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter, SubscribeData } from '@/lib/mailchimp';

/**
 * Handle newsletter subscription via Mailchimp API.
 * 
 * POST /api/newsletter/subscribe
 * 
 * Body:
 *   email (string): User's email address.
 *   firstName (string): User's first name (optional).
 *   lastName (string): User's last name (optional).
 *   location (string): User's location (optional).
 *   interests (string[]): User's interests (optional).
 *   source (string): Signup source (optional).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email address is required.',
          error: 'Missing email'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide a valid email address.',
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Prepare subscription data
    const subscribeData: SubscribeData = {
      email: body.email.toLowerCase().trim(),
      firstName: body.firstName?.trim() || '',
      lastName: body.lastName?.trim() || '',
      location: body.location?.trim() || '',
      interests: Array.isArray(body.interests) ? body.interests : [],
      source: body.source || 'website'
    };

    // Subscribe to Mailchimp
    const result = await subscribeToNewsletter(subscribeData);
    
    // Log successful subscription
    if (result.success) {
      console.log('🌺 Newsletter subscription successful:', {
        email: subscribeData.email,
        source: subscribeData.source,
        interests: subscribeData.interests?.length || 0
      });
    }

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error: any) {
    console.error('🚨 Newsletter subscription API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to process subscription. Please try again later.',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get newsletter subscription status (optional endpoint).
 * 
 * GET /api/newsletter/subscribe?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email parameter is required.',
          error: 'Missing email'
        },
        { status: 400 }
      );
    }

    // For now, return a generic response
    // In the future, you could check subscription status via Mailchimp API
    return NextResponse.json({
      success: true,
      message: 'Use POST to subscribe to newsletter.',
      subscribed: false
    });

  } catch (error: any) {
    console.error('🚨 Newsletter status API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to check subscription status.',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}