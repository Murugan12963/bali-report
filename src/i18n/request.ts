import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Provide a static locale, resolve messages or provide fallback
  return {
    locale: locale || 'en',
    messages: (await import(`../../locales/${locale || 'en'}.json`)).default
  };
});
