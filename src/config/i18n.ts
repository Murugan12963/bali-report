import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define supported languages
export const locales = [
  'en',    // English (Global)
  'id',    // Indonesian
  'zh',    // Chinese
  'ru',    // Russian
  'hi',    // Hindi
  'pt',    // Portuguese (Brazil)
  'ar'     // Arabic (for potential BRICS+ members)
] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`../locales/${locale}.json`)).default,
    timeZone: 'Asia/Jakarta',
    now: new Date()
  };
});