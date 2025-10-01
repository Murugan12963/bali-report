export interface ImpactMetrics {
  totalDonations: number;
  totalSubscriptionRevenue: number;
  bpdAllocation: number;
  projectsSupported: number;
  peopleImpacted: number;
  communitiesServed: number;
  countriesReached: number;
}

export interface ProjectImpact {
  id: string;
  projectId: string;
  metric: string;
  value: number;
  unit: string;
  date: string;
}

export interface ImpactCategory {
  id: string;
  name: string;
  description: string;
  metrics: {
    name: string;
    value: number;
    unit: string;
    change?: number; // percentage change from previous period
  }[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'milestone' | 'update' | 'achievement';
  metrics?: {
    name: string;
    value: number;
    unit: string;
  }[];
}

// Mock data for development
export const MOCK_IMPACT_METRICS: ImpactMetrics = {
  totalDonations: 156750,
  totalSubscriptionRevenue: 45250,
  bpdAllocation: 48500,
  projectsSupported: 12,
  peopleImpacted: 5234,
  communitiesServed: 18,
  countriesReached: 5
};

export const MOCK_IMPACT_CATEGORIES: ImpactCategory[] = [
  {
    id: 'agriculture',
    name: 'Sustainable Agriculture',
    description: 'Supporting farming communities with modern AgriTech solutions',
    metrics: [
      {
        name: 'Farms Modernized',
        value: 24,
        unit: 'farms',
        change: 20
      },
      {
        name: 'Crop Yield Increase',
        value: 35,
        unit: '%',
        change: 15
      },
      {
        name: 'Farmers Trained',
        value: 120,
        unit: 'people',
        change: 25
      }
    ]
  },
  {
    id: 'energy',
    name: 'Renewable Energy',
    description: 'Implementing sustainable energy solutions in BRICS communities',
    metrics: [
      {
        name: 'Solar Installations',
        value: 15,
        unit: 'systems',
        change: 50
      },
      {
        name: 'Energy Capacity',
        value: 75,
        unit: 'kW',
        change: 40
      },
      {
        name: 'CO2 Reduction',
        value: 45,
        unit: 'tons/year',
        change: 30
      }
    ]
  },
  {
    id: 'education',
    name: 'NGO Development',
    description: 'Training and empowering local organizations',
    metrics: [
      {
        name: 'NGOs Supported',
        value: 8,
        unit: 'organizations',
        change: 60
      },
      {
        name: 'Staff Trained',
        value: 45,
        unit: 'people',
        change: 80
      },
      {
        name: 'Projects Launched',
        value: 12,
        unit: 'initiatives',
        change: 33
      }
    ]
  }
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'milestone-1',
    date: '2025-09-01',
    title: '100 Farmers Trained',
    description: 'Reached milestone of training 100 farmers in modern agricultural techniques',
    category: 'milestone',
    metrics: [
      {
        name: 'Farmers Trained',
        value: 100,
        unit: 'people'
      }
    ]
  },
  {
    id: 'achievement-1',
    date: '2025-09-15',
    title: 'Solar Installation Complete',
    description: 'Completed installation of solar panels in 3 villages',
    category: 'achievement',
    metrics: [
      {
        name: 'Power Capacity',
        value: 45,
        unit: 'kW'
      },
      {
        name: 'Households',
        value: 150,
        unit: 'homes'
      }
    ]
  },
  {
    id: 'update-1',
    date: '2025-09-30',
    title: 'NGO Training Program Launch',
    description: 'Launched comprehensive training program for local NGOs',
    category: 'update',
    metrics: [
      {
        name: 'NGOs Enrolled',
        value: 5,
        unit: 'organizations'
      }
    ]
  }
];