"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { GlobeIcon } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Simple language change - would need proper i18n routing setup
    console.log(`Language change to: ${newLocale}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <GlobeIcon className="h-4 w-4 text-gray-500" />
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
        <Button
          variant={locale === "en" ? "default" : "ghost"}
          size="sm"
          className="px-3 py-1.5 text-sm"
          onClick={() => handleLanguageChange("en")}
        >
          English
        </Button>
        <Button
          variant={locale === "id" ? "default" : "ghost"}
          size="sm"
          className="px-3 py-1.5 text-sm"
          onClick={() => handleLanguageChange("id")}
        >
          Indonesia
        </Button>
      </div>
    </div>
  );
}
