export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
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
    category: 'conference',
    format: 'hybrid',
    price: 299,
    capacity: 500,
    ticketsSold: 325,
    speakers: [
      {
        name: 'Dr. Li Wei',
        title: 'Director of Economic Development',
        organization: 'BRICS Research Institute',
        image: '/images/speakers/li-wei.jpg'
      },
      {
        name: 'Prof. Maria Silva',
        title: 'Sustainable Development Expert',
        organization: 'University of São Paulo',
        image: '/images/speakers/maria-silva.jpg'
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
    image: '/images/events/brics-summit.jpg',
    tags: ['BRICS', 'Development', 'Economics', 'Leadership'],
    featured: true
  },
  {
    id: 'bali-tech-forum',
    title: 'Bali Tech Innovation Forum',
    description: 'Explore technological innovations and digital transformation in BRICS nations.',
    date: '2025-11-05',
    location: 'Trans Resort Bali',
    category: 'conference',
    format: 'in-person',
    price: 199,
    capacity: 300,
    ticketsSold: 145,
    speakers: [
      {
        name: 'Raj Patel',
        title: 'Chief Innovation Officer',
        organization: 'TechBRICS',
        image: '/images/speakers/raj-patel.jpg'
      }
    ],
    image: '/images/events/tech-forum.jpg',
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
    image: '/images/events/energy-webinar.jpg',
    tags: ['Energy', 'Sustainability', 'Virtual', 'BRICS']
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