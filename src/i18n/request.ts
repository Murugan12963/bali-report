import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Always use English for now since we only have en.json
  const locale = "en";

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default,
    timeZone: "Asia/Jakarta",
    now: new Date(),
  };
});
