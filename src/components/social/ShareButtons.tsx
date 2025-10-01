"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Twitter, Send, Facebook, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  showShareCount?: boolean;
}

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<any>;
  getShareUrl: (props: ShareButtonsProps) => string;
  platforms?: string[]; // Specific platforms where this share option should appear
  color: string;
}

const platforms: SocialPlatform[] = [
  {
    name: "X",
    icon: Twitter,
    color: "text-black dark:text-white",
    getShareUrl: ({ url, title }) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    icon: Send,
    color: "text-[#229ED9]",
    getShareUrl: ({ url, title }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },

  {
    name: "Facebook",
    icon: Facebook,
    color: "text-[#1877F2]",
    getShareUrl: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export function ShareButtons({
  url,
  title,
  description,
  className = "",
  showShareCount = false,
}: ShareButtonsProps) {
  const locale = useLocale();
  const { toast } = useToast();

  // Filter platforms based on locale
  const relevantPlatforms = platforms.filter(
    (platform) => !platform.platforms || platform.platforms.includes(locale),
  );

  const handleShare = async (platform: SocialPlatform) => {
    try {
      // Use native share if available
      if (navigator.share && platform.name === "Share") {
        await navigator.share({
          title,
          text: description,
          url,
        });
        return;
      }

      // Open share URL in new window
      window.open(
        platform.getShareUrl({ url, title, description }),
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {relevantPlatforms.map((platform) => (
        <Button
          key={platform.name}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => handleShare(platform)}
        >
          <platform.icon className={`h-4 w-4 ${platform.color}`} />
          <span className="hidden sm:inline">{platform.name}</span>
          {showShareCount && <span className="text-xs text-gray-500">0</span>}
        </Button>
      ))}

      {/* Copy Link Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={copyLink}
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copy</span>
      </Button>

      {/* Native Share (Mobile) */}
      {typeof navigator !== "undefined" && navigator.share !== undefined && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 sm:hidden"
          onClick={() =>
            handleShare({
              name: "Share",
              icon: Share2,
              color: "",
              getShareUrl: () => "",
            })
          }
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
