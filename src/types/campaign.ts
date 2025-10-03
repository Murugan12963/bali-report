/**
 * BPD (Bali People's Development) Campaign Types
 */

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number; // Target amount in USD
  raised: number; // Amount raised so far in USD
  currency: string;
  category:
    | "education"
    | "healthcare"
    | "infrastructure"
    | "environment"
    | "community";
  status: "active" | "completed" | "pending";
  startDate: Date;
  endDate?: Date;
  image?: string;
  location?: string;
  beneficiaries?: number; // Number of people who will benefit
  updates?: CampaignUpdate[];
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  date: Date;
  images?: string[];
}

export interface Donation {
  id: string;
  campaignId?: string; // Optional - for general donations
  amount: number;
  currency: string;
  donorName?: string;
  message?: string;
  date: Date;
  type: "one-time" | "subscription";
  status: "pending" | "completed" | "failed";
}

export interface CampaignStats {
  totalRaised: number;
  totalDonors: number;
  activeCampaigns: number;
  completedCampaigns: number;
  beneficiaries: number;
}
