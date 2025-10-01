import { locales } from "@/config/i18n";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale;

  // Show a 404 error if the user requests an unknown locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <html lang={currentLocale}>
      <body className={inter.className}>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <nav className="flex items-center gap-6 text-sm">
              {/* Add your navigation items here */}
            </nav>
            <LanguageSwitcher />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
