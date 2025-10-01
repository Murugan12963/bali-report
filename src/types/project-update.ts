export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  type: "milestone" | "progress" | "challenge" | "success";
  metrics?: {
    name: string;
    value: number;
    unit: string;
    change?: number;
  }[];
  images?: {
    url: string;
    caption: string;
  }[];
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: "agritech" | "energy" | "ngo";
  location: string;
  startDate: string;
  status: "planned" | "active" | "completed";
  budget: number;
  fundingReceived: number;
  impact: {
    metric: string;
    value: number;
    unit: string;
  }[];
  partners: {
    name: string;
    logo?: string;
    role: string;
  }[];
  updates: ProjectUpdate[];
}

// Mock data for development
export const MOCK_PROJECTS: Project[] = [
  {
    id: "bali-solar-initiative",
    name: "Bali Solar Initiative",
    description:
      "Solar power installation project for rural communities in Bali.",
    category: "energy",
    location: "Karangasem, Bali",
    startDate: "2025-06-01",
    status: "active",
    budget: 75000,
    fundingReceived: 45000,
    impact: [
      {
        metric: "Households Powered",
        value: 150,
        unit: "homes",
      },
      {
        metric: "CO2 Reduction",
        value: 45,
        unit: "tons/year",
      },
    ],
    partners: [
      {
        name: "Bali Energy Cooperative",
        role: "Local Implementation",
        logo: "/images/partners/bec-logo.png",
      },
      {
        name: "Solar Tech Solutions",
        role: "Technical Partner",
        logo: "/images/partners/sts-logo.png",
      },
    ],
    updates: [
      {
        id: "bsi-update-1",
        projectId: "bali-solar-initiative",
        title: "First Phase Installation Complete",
        content:
          "Successfully completed installation of solar panels in 50 households.",
        date: "2025-08-15",
        author: {
          name: "Sarah Chen",
          role: "Project Manager",
          avatar: "/images/team/sarah-chen.jpg",
        },
        type: "milestone",
        metrics: [
          {
            name: "Installations",
            value: 50,
            unit: "households",
            change: 100,
          },
          {
            name: "Power Generation",
            value: 15,
            unit: "kW",
            change: 100,
          },
        ],
        images: [
          {
            url: "/images/updates/solar-installation.jpg",
            caption: "Installation team setting up solar panels",
          },
        ],
        tags: ["Solar", "Installation", "Phase 1"],
      },
    ],
  },
  {
    id: "smart-farming-bali",
    name: "Smart Farming Bali",
    description:
      "Implementing smart agriculture technologies for local farmers.",
    category: "agritech",
    location: "Tabanan, Bali",
    startDate: "2025-07-01",
    status: "active",
    budget: 50000,
    fundingReceived: 35000,
    impact: [
      {
        metric: "Farmers Supported",
        value: 75,
        unit: "farmers",
      },
      {
        metric: "Yield Increase",
        value: 30,
        unit: "%",
      },
    ],
    partners: [
      {
        name: "Bali Farmers Association",
        role: "Community Partner",
        logo: "/images/partners/bfa-logo.png",
      },
    ],
    updates: [
      {
        id: "sfb-update-1",
        projectId: "smart-farming-bali",
        title: "Smart Irrigation System Deployment",
        content:
          "Installed smart irrigation systems in 25 farms with real-time monitoring.",
        date: "2025-08-20",
        author: {
          name: "Made Wijaya",
          role: "Agricultural Expert",
          avatar: "/images/team/made-wijaya.jpg",
        },
        type: "progress",
        metrics: [
          {
            name: "Water Savings",
            value: 40,
            unit: "%",
            change: 40,
          },
          {
            name: "Farms Connected",
            value: 25,
            unit: "farms",
            change: 50,
          },
        ],
        images: [
          {
            url: "/images/updates/smart-irrigation.jpg",
            caption: "Smart irrigation system in action",
          },
        ],
        tags: ["Irrigation", "Technology", "Water Conservation"],
      },
    ],
  },
  {
    id: "bali-ngo-capacity",
    name: "Bali NGO Capacity Building",
    description: "Training and development program for local NGOs.",
    category: "ngo",
    location: "Denpasar, Bali",
    startDate: "2025-08-01",
    status: "active",
    budget: 35000,
    fundingReceived: 25000,
    impact: [
      {
        metric: "NGOs Trained",
        value: 12,
        unit: "organizations",
      },
      {
        metric: "Staff Trained",
        value: 45,
        unit: "people",
      },
    ],
    partners: [
      {
        name: "Bali NGO Network",
        role: "Network Partner",
        logo: "/images/partners/bnn-logo.png",
      },
    ],
    updates: [
      {
        id: "bnc-update-1",
        projectId: "bali-ngo-capacity",
        title: "First Training Workshop Success",
        content:
          "Completed first comprehensive training workshop with 15 NGO representatives.",
        date: "2025-08-25",
        author: {
          name: "Putu Ayu",
          role: "Training Coordinator",
          avatar: "/images/team/putu-ayu.jpg",
        },
        type: "success",
        metrics: [
          {
            name: "Participants",
            value: 15,
            unit: "people",
            change: 100,
          },
          {
            name: "Satisfaction",
            value: 95,
            unit: "%",
            change: 0,
          },
        ],
        images: [
          {
            url: "/images/updates/ngo-workshop.jpg",
            caption: "NGO representatives during the training session",
          },
        ],
        tags: ["Training", "Capacity Building", "Workshop"],
      },
    ],
  },
];
