export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  interval: 'month' | 'year';
  features: string[];
  bpdAllocation: number; // percentage allocated to BPD
  popular?: boolean;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  includedIn: ('basic' | 'premium' | 'enterprise')[];
}

export const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  {
    id: 'ad-free',
    name: 'Ad-Free Experience',
    description: 'Enjoy an uninterrupted reading experience without any advertisements.',
    includedIn: ['basic', 'premium', 'enterprise']
  },
  {
    id: 'bali-guides',
    name: 'Exclusive Bali Event Guides',
    description: 'Get access to curated guides for upcoming events in Bali.',
    includedIn: ['basic', 'premium', 'enterprise']
  },
  {
    id: 'brics-analysis',
    name: 'Curated BRICS Analysis',
    description: 'In-depth analysis of BRICS news and developments.',
    includedIn: ['premium', 'enterprise']
  },
  {
    id: 'webinar-access',
    name: 'Early Webinar Access',
    description: 'Get priority access to upcoming webinars and virtual events.',
    includedIn: ['premium', 'enterprise']
  },
  {
    id: 'custom-alerts',
    name: 'Custom News Alerts',
    description: 'Set up personalized alerts for topics you care about.',
    includedIn: ['enterprise']
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Programmatic access to our news and analysis.',
    includedIn: ['enterprise']
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for casual readers who want an ad-free experience.',
    price: 2,
    interval: 'month',
    features: [
      'Ad-Free Experience',
      'Exclusive Bali Event Guides',
      '20% to BPD Projects'
    ],
    bpdAllocation: 20
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enhanced access with exclusive analysis and early access to events.',
    price: 5,
    interval: 'month',
    features: [
      'Ad-Free Experience',
      'Exclusive Bali Event Guides',
      'Curated BRICS Analysis',
      'Early Webinar Access',
      '25% to BPD Projects'
    ],
    bpdAllocation: 25,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full access with API integration and custom features.',
    price: 15,
    interval: 'month',
    features: [
      'Ad-Free Experience',
      'Exclusive Bali Event Guides',
      'Curated BRICS Analysis',
      'Early Webinar Access',
      'Custom News Alerts',
      'API Access',
      '30% to BPD Projects'
    ],
    bpdAllocation: 30
  }
];