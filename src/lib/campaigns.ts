/**
 * BPD Campaign Management Service
 * Handles fundraising campaigns and donation tracking
 */

import { Campaign, CampaignStats, Donation } from '@/types/campaign';

// Mock data - replace with database queries in production
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_001',
    title: 'Bali Community Library Project',
    description: 'Building a free community library in Ubud to promote education and cultural exchange among BRICS nations and Indonesia.',
    goal: 50000,
    raised: 32500,
    currency: 'USD',
    category: 'education',
    status: 'active',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-31'),
    image: '/campaigns/library.jpg',
    location: 'Ubud, Bali',
    beneficiaries: 500,
  },
  {
    id: 'camp_002',
    title: 'Clean Water Initiative',
    description: 'Providing clean water access to remote villages in Bali through sustainable infrastructure.',
    goal: 100000,
    raised: 75000,
    currency: 'USD',
    category: 'infrastructure',
    status: 'active',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2026-01-31'),
    image: '/campaigns/water.jpg',
    location: 'Northern Bali Villages',
    beneficiaries: 2000,
  },
  {
    id: 'camp_003',
    title: 'Mangrove Restoration Project',
    description: 'Restoring coastal mangrove forests to protect Bali from climate change and preserve marine ecosystems.',
    goal: 30000,
    raised: 30000,
    currency: 'USD',
    category: 'environment',
    status: 'completed',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-09-30'),
    image: '/campaigns/mangrove.jpg',
    location: 'Sanur Beach',
    beneficiaries: 1000,
  },
];

/**
 * Get all campaigns
 */
export function getCampaigns(status?: Campaign['status']): Campaign[] {
  if (status) {
    return MOCK_CAMPAIGNS.filter((c) => c.status === status);
  }
  return MOCK_CAMPAIGNS;
}

/**
 * Get campaign by ID
 */
export function getCampaignById(id: string): Campaign | null {
  return MOCK_CAMPAIGNS.find((c) => c.id === id) || null;
}

/**
 * Get active campaigns
 */
export function getActiveCampaigns(): Campaign[] {
  return MOCK_CAMPAIGNS.filter((c) => c.status === 'active');
}

/**
 * Calculate campaign progress percentage
 */
export function getCampaignProgress(campaign: Campaign): number {
  if (campaign.goal === 0) return 0;
  return Math.min((campaign.raised / campaign.goal) * 100, 100);
}

/**
 * Get campaign stats
 */
export function getCampaignStats(): CampaignStats {
  const totalRaised = MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.raised, 0);
  const activeCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === 'active').length;
  const completedCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === 'completed').length;
  const beneficiaries = MOCK_CAMPAIGNS.reduce((sum, c) => sum + (c.beneficiaries || 0), 0);

  return {
    totalRaised,
    totalDonors: 0, // TODO: Count from donations table
    activeCampaigns,
    completedCampaigns,
    beneficiaries,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Create donation (mock - replace with Stripe API)
 */
export async function createDonation(donation: Omit<Donation, 'id' | 'date' | 'status'>): Promise<Donation> {
  // TODO: Integrate with Stripe API
  // 1. Create Stripe PaymentIntent or Checkout Session
  // 2. Save donation to database
  // 3. Update campaign raised amount
  // 4. Send confirmation email

  const newDonation: Donation = {
    ...donation,
    id: `don_${Date.now()}`,
    date: new Date(),
    status: 'pending',
  };

  console.log('💰 Creating donation:', newDonation);
  return newDonation;
}

/**
 * Calculate BPD allocation from revenue
 * 20% of subscription revenue goes to BPD fund
 */
export function calculateBPDAllocation(revenue: number): number {
  return revenue * 0.2;
}
