export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  country: 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa' | 'Indonesia' | 'Iran' | 'UAE' | 'Saudi Arabia' | 'Egypt' | 'Ethiopia' | 'Thailand' | 'Vietnam' | 'Malaysia' | 'Online';
  category: 'conference' | 'webinar' | 'workshop' | 'cultural' | 'networking';
  format: 'in-person' | 'virtual' | 'hybrid';
  price: number;
  capacity: number;
  ticketsSold: number;
  speakers?: {
    name: string;
    title: string;
    organization: string;
    image?: string;
  }[];
  agenda?: {
    time: string;
    title: string;
    description: string;
  }[];
  image?: string;
  tags: string[];
  featured?: boolean;
}

export interface EventTicket {
  id: string;
  eventId: string;
  type: 'standard' | 'vip' | 'early-bird';
  price: number;
  description: string;
  availableCount: number;
  soldCount: number;
  benefits: string[];
}

// Mock data for development
export const MOCK_EVENTS: Event[] = [
  {
    id: 'brics-summit-2025',
    title: 'BRICS Development Summit 2025',
    description: 'Join leaders from BRICS nations for discussions on sustainable development and economic cooperation.',
    date: '2025-10-15',
    endDate: '2025-10-17',
    location: 'Nusa Dua Convention Center, Bali',
    country: 'Indonesia',
    category: 'conference',
    format: 'hybrid',
    price: 299,
    capacity: 500,
    ticketsSold: 325,
    speakers: [
      {
        name: 'Dr. Li Wei',
        title: 'Director of Economic Development',
        organization: 'BRICS Research Institute'
      },
      {
        name: 'Prof. Maria Silva',
        title: 'Sustainable Development Expert',
        organization: 'University of São Paulo'
      }
    ],
    agenda: [
      {
        time: '09:00',
        title: 'Opening Ceremony',
        description: 'Welcome addresses from BRICS representatives'
      },
      {
        time: '10:30',
        title: 'Keynote: Future of BRICS Cooperation',
        description: 'Discussion on expanding economic partnerships'
      }
    ],
    tags: ['BRICS', 'Development', 'Economics', 'Leadership'],
    featured: true
  },
  {
    id: 'bali-tech-forum',
    title: 'Bali Tech Innovation Forum',
    description: 'Explore technological innovations and digital transformation in BRICS nations.',
    date: '2025-11-05',
    location: 'Trans Resort Bali',
    country: 'Indonesia',
    category: 'conference',
    format: 'in-person',
    price: 199,
    capacity: 300,
    ticketsSold: 145,
    speakers: [
      {
        name: 'Raj Patel',
        title: 'Chief Innovation Officer',
        organization: 'TechBRICS'
      }
    ],
    tags: ['Technology', 'Innovation', 'Digital', 'BRICS'],
    featured: true
  },
  {
    id: 'sustainable-energy-2025',
    title: 'BRICS Sustainable Energy Webinar',
    description: 'Virtual discussion on renewable energy initiatives across BRICS nations.',
    date: '2025-09-30',
    category: 'webinar',
    format: 'virtual',
    price: 49,
    capacity: 1000,
    ticketsSold: 567,
    location: 'Online',
    country: 'Online',
    tags: ['Energy', 'Sustainability', 'Virtual', 'BRICS']
  },
  // Brazil Events
  {
    id: 'sao-paulo-brics-finance',
    title: 'BRICS Financial Integration Conference',
    description: 'Exploring alternative financial systems and economic cooperation between BRICS nations.',
    date: '2025-11-20',
    endDate: '2025-11-22',
    location: 'São Paulo Convention Center',
    country: 'Brazil',
    category: 'conference',
    format: 'hybrid',
    price: 399,
    capacity: 800,
    ticketsSold: 620,
    speakers: [
      {
        name: 'Dr. Carlos Silva',
        title: 'Minister of Economic Development',
        organization: 'Brazilian Government'
      },
      {
        name: 'Prof. Ana Rodriguez',
        title: 'BRICS Banking Expert',
        organization: 'University of São Paulo'
      }
    ],
    tags: ['Finance', 'Economics', 'BRICS', 'Banking'],
    featured: true
  },
  {
    id: 'rio-cultural-festival',
    title: 'Rio BRICS Cultural Festival',
    description: 'Celebrating the rich cultural heritage of BRICS nations through music, art, and food.',
    date: '2025-12-05',
    endDate: '2025-12-08',
    location: 'Copacabana Beach, Rio de Janeiro',
    country: 'Brazil',
    category: 'cultural',
    format: 'in-person',
    price: 75,
    capacity: 2000,
    ticketsSold: 1456,
    tags: ['Culture', 'Festival', 'Music', 'Art', 'BRICS']
  },
  // Russia Events
  {
    id: 'moscow-tech-summit',
    title: 'Moscow Digital Sovereignty Summit',
    description: 'Discussing technological independence and digital infrastructure development across BRICS.',
    date: '2025-10-08',
    endDate: '2025-10-10',
    location: 'Moscow International Business Center',
    country: 'Russia',
    category: 'conference',
    format: 'hybrid',
    price: 450,
    capacity: 600,
    ticketsSold: 520,
    speakers: [
      {
        name: 'Dr. Vladimir Petrov',
        title: 'Director of Digital Development',
        organization: 'Russian Academy of Sciences'
      }
    ],
    tags: ['Technology', 'Digital', 'Infrastructure', 'BRICS'],
    featured: true
  },
  {
    id: 'st-petersburg-energy',
    title: 'St. Petersburg Energy Cooperation Forum',
    description: 'Focus on energy partnerships, pipeline projects, and renewable energy initiatives.',
    date: '2025-09-15',
    location: 'Expoforum Convention Center, St. Petersburg',
    country: 'Russia',
    category: 'conference',
    format: 'in-person',
    price: 350,
    capacity: 400,
    ticketsSold: 285,
    tags: ['Energy', 'Oil', 'Gas', 'Renewable', 'BRICS']
  },
  // India Events
  {
    id: 'new-delhi-trade-expo',
    title: 'New Delhi BRICS Trade & Commerce Expo',
    description: 'Showcasing trade opportunities and business partnerships across BRICS nations.',
    date: '2025-11-12',
    endDate: '2025-11-15',
    location: 'India Expo Centre, Greater Noida',
    country: 'India',
    category: 'conference',
    format: 'hybrid',
    price: 250,
    capacity: 1200,
    ticketsSold: 890,
    speakers: [
      {
        name: 'Dr. Priya Sharma',
        title: 'Trade Minister',
        organization: 'Government of India'
      },
      {
        name: 'Mr. Rajesh Gupta',
        title: 'BRICS Business Council Chair',
        organization: 'BRICS India'
      }
    ],
    tags: ['Trade', 'Commerce', 'Business', 'Export', 'BRICS'],
    featured: true
  },
  {
    id: 'mumbai-fintech',
    title: 'Mumbai FinTech Innovation Workshop',
    description: 'Exploring financial technology solutions for BRICS payment systems and digital currencies.',
    date: '2025-10-25',
    location: 'Bombay Stock Exchange, Mumbai',
    country: 'India',
    category: 'workshop',
    format: 'in-person',
    price: 180,
    capacity: 300,
    ticketsSold: 245,
    tags: ['FinTech', 'Digital Currency', 'Payments', 'Innovation']
  },
  // China Events
  {
    id: 'beijing-belt-road',
    title: 'Beijing Belt & Road BRICS Initiative',
    description: 'Strategic discussions on infrastructure development and connectivity projects.',
    date: '2025-10-30',
    endDate: '2025-11-01',
    location: 'China National Convention Center, Beijing',
    country: 'China',
    category: 'conference',
    format: 'hybrid',
    price: 380,
    capacity: 1000,
    ticketsSold: 750,
    speakers: [
      {
        name: 'Prof. Wang Li',
        title: 'Infrastructure Development Director',
        organization: 'Chinese Academy of Social Sciences'
      }
    ],
    tags: ['Infrastructure', 'Belt and Road', 'Development', 'BRICS'],
    featured: true
  },
  {
    id: 'shanghai-green-tech',
    title: 'Shanghai Green Technology Symposium',
    description: 'Innovative environmental technologies and sustainable development practices.',
    date: '2025-09-20',
    location: 'Shanghai International Convention Center',
    country: 'China',
    category: 'conference',
    format: 'in-person',
    price: 290,
    capacity: 650,
    ticketsSold: 520,
    tags: ['Green Technology', 'Environment', 'Sustainability', 'Innovation']
  },
  // South Africa Events
  {
    id: 'cape-town-mining',
    title: 'Cape Town BRICS Mining & Resources Summit',
    description: 'Discussing mineral resources cooperation and sustainable mining practices.',
    date: '2025-11-28',
    endDate: '2025-11-30',
    location: 'Cape Town International Convention Centre',
    country: 'South Africa',
    category: 'conference',
    format: 'hybrid',
    price: 420,
    capacity: 700,
    ticketsSold: 485,
    speakers: [
      {
        name: 'Dr. Thabo Mthembu',
        title: 'Minister of Mineral Resources',
        organization: 'South African Government'
      }
    ],
    tags: ['Mining', 'Resources', 'Minerals', 'Sustainability', 'BRICS']
  },
  {
    id: 'johannesburg-healthcare',
    title: 'Johannesburg BRICS Healthcare Innovation',
    description: 'Collaborative healthcare solutions and medical technology sharing between BRICS nations.',
    date: '2025-12-10',
    location: 'Sandton Convention Centre, Johannesburg',
    country: 'South Africa',
    category: 'conference',
    format: 'hybrid',
    price: 320,
    capacity: 500,
    ticketsSold: 380,
    tags: ['Healthcare', 'Medicine', 'Innovation', 'Collaboration']
  },
  // Iran Events
  {
    id: 'tehran-energy-cooperation',
    title: 'Tehran Energy Security Conference',
    description: 'Regional energy cooperation and security discussions among BRICS+ nations.',
    date: '2025-10-18',
    location: 'Tehran International Conference Center',
    country: 'Iran',
    category: 'conference',
    format: 'in-person',
    price: 275,
    capacity: 450,
    ticketsSold: 350,
    tags: ['Energy', 'Security', 'Regional', 'Cooperation']
  },
  // UAE Events
  {
    id: 'dubai-brics-business',
    title: 'Dubai BRICS+ Business Forum',
    description: 'Business networking and investment opportunities in the expanded BRICS framework.',
    date: '2025-11-08',
    endDate: '2025-11-09',
    location: 'Dubai World Trade Centre',
    country: 'UAE',
    category: 'networking',
    format: 'in-person',
    price: 500,
    capacity: 800,
    ticketsSold: 650,
    speakers: [
      {
        name: 'Sheikh Mohammed Al-Rashid',
        title: 'Investment Director',
        organization: 'Dubai Investment Authority'
      }
    ],
    tags: ['Business', 'Investment', 'Networking', 'BRICS+'],
    featured: true
  },
  // Virtual Events
  {
    id: 'virtual-agriculture-webinar',
    title: 'BRICS Agricultural Technology Webinar',
    description: 'Virtual showcase of agricultural innovations and food security solutions.',
    date: '2025-09-25',
    location: 'Online',
    country: 'Online',
    category: 'webinar',
    format: 'virtual',
    price: 35,
    capacity: 2000,
    ticketsSold: 1650,
    tags: ['Agriculture', 'Technology', 'Food Security', 'Virtual']
  },
  {
    id: 'virtual-youth-summit',
    title: 'BRICS Youth Leadership Summit 2025',
    description: 'Empowering the next generation of BRICS leaders through virtual collaboration.',
    date: '2025-12-15',
    endDate: '2025-12-17',
    location: 'Online',
    country: 'Online',
    category: 'conference',
    format: 'virtual',
    price: 25,
    capacity: 5000,
    ticketsSold: 3800,
    speakers: [
      {
        name: 'Various Young Leaders',
        title: 'Youth Representatives',
        organization: 'BRICS Youth Network'
      }
    ],
    tags: ['Youth', 'Leadership', 'Virtual', 'Future', 'BRICS']
  }
];

export const MOCK_TICKETS: EventTicket[] = [
  {
    id: 'standard-summit',
    eventId: 'brics-summit-2025',
    type: 'standard',
    price: 299,
    description: 'Access to all conference sessions and networking events',
    availableCount: 400,
    soldCount: 275,
    benefits: [
      'Access to all sessions',
      'Networking lunch',
      'Conference materials',
      'Certificate of attendance'
    ]
  },
  {
    id: 'vip-summit',
    eventId: 'brics-summit-2025',
    type: 'vip',
    price: 599,
    description: 'Premium access with exclusive networking opportunities',
    availableCount: 100,
    soldCount: 50,
    benefits: [
      'Priority seating',
      'Exclusive VIP reception',
      'Direct access to speakers',
      'Private networking sessions',
      'Premium conference materials'
    ]
  },
  {
    id: 'standard-tech',
    eventId: 'bali-tech-forum',
    type: 'standard',
    price: 199,
    description: 'Full access to the tech forum',
    availableCount: 250,
    soldCount: 125,
    benefits: [
      'All sessions access',
      'Lunch and refreshments',
      'Forum materials',
      'Innovation showcase access'
    ]
  },
  {
    id: 'webinar-standard',
    eventId: 'sustainable-energy-2025',
    type: 'standard',
    price: 49,
    description: 'Full webinar access with Q&A participation',
    availableCount: 1000,
    soldCount: 567,
    benefits: [
      'Live webinar access',
      'Q&A participation',
      'Presentation slides',
      'Recording access'
    ]
  }
];