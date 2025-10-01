import { redirect } from 'next/navigation';
import { locales } from '@/config/i18n';

/**
 * Locale-specific homepage that redirects to the main homepage
 * This prevents 404 errors for locale routes like /en, /id, etc.
 */
export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale and redirect to homepage
  if (locales.includes(locale as any)) {
    redirect('/');
  } else {
    // If locale is invalid, redirect to 404
    redirect('/404');
  }
}
