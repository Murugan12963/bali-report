/**
 * Types for Adsterra ad formats and configurations
 */

export type AdsterraAdType = "banner" | "social-bar" | "native" | "popunder";

export interface AdsterraConfig {
  type: AdsterraAdType;
  dimensions: string;
  position: string;
  defaultZone: string | undefined;
  script: string;
  style: React.CSSProperties;
}

export interface AdsterraInitOptions {
  key: string;
  format?: "social-bar" | "native" | "popunder";
}

// Environment variables interface for TypeScript support
export interface AdsterraEnvVars {
  NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID: string;
  NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_ZONE_ID: string;
  NEXT_PUBLIC_ADSTERRA_NATIVE_ZONE_ID: string;
  NEXT_PUBLIC_ADSTERRA_POPUNDER_ZONE_ID: string;
  NEXT_PUBLIC_ADSTERRA_DEFAULT_ZONE_ID: string;
}