import createMiddleware from 'next-intl/middleware';
import { locales } from '@/config/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Domains can be used for language-specific domains
  // domains: [
  //   {
  //     domain: 'bali.report',
  //     defaultLocale: 'en',
  //   },
  //   {
  //     domain: 'id.bali.report',
  //     defaultLocale: 'id',
  //   },
  // ],
});

export const config = {
  // Match all routes except for
  // - static files in the public folder
  // - api routes
  // - static assets
  // - _next internal routes
  matcher: ['/((?!api|_next|.*\\..*).*)']
};