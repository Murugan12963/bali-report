'use server';

import { subscribeToNewsletter, sendWelcomeEmail, SubscribeData } from '@/lib/mailchimp';

export async function subscribeNewsletter(data: SubscribeData) {
  // Subscribe to newsletter
  const result = await subscribeToNewsletter(data);

  // If subscription was successful, send welcome email
  if (result.success) {
    await sendWelcomeEmail(data.email, data.firstName);
  }

  return result;
}