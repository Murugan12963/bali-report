export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  category: 'agritech' | 'energy' | 'ngo' | 'other';
  status: 'active' | 'completed' | 'upcoming';
  coverImage?: string;
  updates: CampaignUpdate[];
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  date: string;
  author: string;
  images?: string[];
}

export interface CampaignProgress {
  totalRaised: number;
  percentageComplete: number;
  donorsCount: number;
  daysRemaining: number;
}

export interface CampaignFilters {
  category?: Campaign['category'];
  status?: Campaign['status'];
  searchQuery?: string;
}

// Mock data for development
export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'brics-harvest-2025',
    title: 'BRICS Harvest Challenge 2025',
    description: 'Supporting sustainable farming initiatives across Indonesia with modern AgriTech solutions.',
    goal: 50000,
    raised: 32500,
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    category: 'agritech',
    status: 'active',
    coverImage: '/images/campaigns/harvest-2025.jpg',
    updates: [
      {
        id: 'update-1',
        campaignId: 'brics-harvest-2025',
        title: 'First Milestone Reached',
        content: 'Successfully implemented smart irrigation systems in 5 farming communities.',
        date: '2025-09-15',
        author: 'Project Lead',
        images: ['/images/updates/irrigation-system.jpg']
      }
    ]
  },
  {
    id: 'multipolar-energy-2025',
    title: 'Multipolar Independence Fund',
    description: 'Funding renewable energy projects in BRICS communities for energy independence.',
    goal: 75000,
    raised: 45000,
    startDate: '2025-08-15',
    endDate: '2025-12-15',
    category: 'energy',
    status: 'active',
    coverImage: '/images/campaigns/energy-2025.jpg',
    updates: [
      {
        id: 'update-1',
        campaignId: 'multipolar-energy-2025',
        title: 'Solar Installation Progress',
        content: 'Completed installation of solar panels in 3 villages.',
        date: '2025-09-01',
        author: 'Energy Team Lead',
        images: ['/images/updates/solar-installation.jpg']
      }
    ]
  },
  {
    id: 'bali-solar-2025',
    title: 'Bali Solar Projects',
    description: 'Community funding for solar energy installations across Bali.',
    goal: 25000,
    raised: 18750,
    startDate: '2025-09-15',
    endDate: '2025-11-15',
    category: 'energy',
    status: 'active',
    coverImage: '/images/campaigns/bali-solar.jpg',
    updates: [
      {
        id: 'update-1',
        campaignId: 'bali-solar-2025',
        title: 'Project Launch',
        content: 'Successfully launched the first phase of solar installations.',
        date: '2025-09-20',
        author: 'Bali Project Manager',
        images: ['/images/updates/bali-launch.jpg']
      }
    ]
  }
];