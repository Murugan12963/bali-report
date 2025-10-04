import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Bali Report - News Without Borders',
  description: 'Learn about Bali Report\'s mission to provide multipolar news perspectives from BRICS nations and the Global South, plus our BRICS Partnership for Development initiatives.',
  openGraph: {
    title: 'About Bali Report',
    description: 'Multipolar news aggregation challenging Western media monopoly with diverse perspectives from BRICS nations and Indonesia.',
    type: 'website',
  },
};

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  location: string;
  image?: string;
  expertise: string[];
}

interface Milestone {
  date: string;
  title: string;
  description: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Dr. Maya Sari',
    role: 'Editorial Director',
    bio: 'Former Jakarta Post editor with 15 years of experience covering Southeast Asian politics and ASEAN-China relations.',
    location: 'Jakarta, Indonesia',
    expertise: ['Regional Politics', 'Media Ethics', 'ASEAN Relations']
  },
  {
    name: 'Ahmad Rizki',
    role: 'Senior Analyst',
    bio: 'Economic policy researcher specializing in South-South cooperation and BRICS trade relationships.',
    location: 'Yogyakarta, Indonesia',
    expertise: ['Economic Policy', 'BRICS Analysis', 'Trade Relations']
  },
  {
    name: 'Sarah Wijaya',
    role: 'Technology Editor',
    bio: 'Tech journalist and startup advisor tracking digital transformation across emerging markets.',
    location: 'Denpasar, Bali',
    expertise: ['Digital Policy', 'Startup Ecosystem', 'Tech Innovation']
  },
  {
    name: 'Prof. Liu Wei',
    role: 'Contributing Analyst',
    bio: 'Visiting scholar focusing on digital diplomacy and China\'s information infrastructure initiatives.',
    location: 'Singapore',
    expertise: ['Digital Diplomacy', 'Information Governance', 'BRI Analysis']
  },
];

const MILESTONES: Milestone[] = [
  {
    date: '2025-09-15',
    title: 'Bali Report Launch',
    description: 'Platform goes live with 9 RSS sources and 500+ daily articles from BRICS-aligned and Indonesian media.'
  },
  {
    date: '2025-09-20',
    title: 'Community Features',
    description: 'Added voting system, personalized content, and save-for-later functionality.'
  },
  {
    date: '2025-10-01',
    title: 'BPD Integration',
    description: 'Launched BRICS Partnership for Development fundraising campaigns and impact tracking.'
  },
  {
    date: '2025-10-03',
    title: 'Opinion Platform',
    description: 'Introduced editorial section featuring diverse perspectives from Global South contributors.'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About Bali Report
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            News Without Borders — Challenging Western media monopoly with 
            diverse perspectives from BRICS nations, Indonesia, and the Global South
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-3">Multipolar News</h3>
                <p className="text-teal-100">
                  Aggregate diverse perspectives from BRICS nations and Global South media sources
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold mb-3">Challenge Bias</h3>
                <p className="text-teal-100">
                  Counter Western media hegemony with alternative viewpoints and untold stories
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3">Build Bridges</h3>
                <p className="text-teal-100">
                  Foster South-South cooperation through shared understanding and dialogue
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">9</div>
              <div className="text-gray-600 dark:text-gray-300">RSS Sources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Daily Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">7</div>
              <div className="text-gray-600 dark:text-gray-300">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Live Updates</div>
            </div>
          </div>
        </section>

        {/* What We Cover */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What We Cover
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🏛️</span>
                BRICS Global
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Russia, China, India, Brazil, South Africa news</li>
                <li>• BRICS+ expansion and new member coverage</li>
                <li>• Alternative economic systems and cooperation</li>
                <li>• Multipolar world order developments</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🇮🇩</span>
                Indonesia Focus
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• National politics and policy</li>
                <li>• Economic developments and trade</li>
                <li>• ASEAN relations and diplomacy</li>
                <li>• Cultural and social movements</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🏝️</span>
                Bali & Local
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Local Balinese news and events</li>
                <li>• Tourism industry developments</li>
                <li>• Environmental and sustainability issues</li>
                <li>• Cultural preservation initiatives</li>
              </ul>
            </div>
          </div>
        </section>

        {/* BPD Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
              BRICS Partnership for Development (BPD)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-green-100 mb-6 leading-relaxed">
                  BPD is our initiative to channel subscription revenue into concrete 
                  development projects across BRICS nations, with a focus on Indonesia and Bali.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌱</span>
                    <span className="text-green-100">AgriTech projects in rural Indonesia</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚡</span>
                    <span className="text-green-100">Sustainable energy solutions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📚</span>
                    <span className="text-green-100">NGO training and development</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🤝</span>
                    <span className="text-green-100">South-South cooperation initiatives</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Fund Allocation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>BPD Projects</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Editorial Content</span>
                    <span className="font-bold">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Infrastructure</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operations</span>
                    <span className="font-bold">15%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-green-100">
                    Transparent reporting quarterly on all fund usage and project impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-teal-600 dark:text-teal-400 font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      📍 {member.location}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {member.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Journey
          </h2>
          <div className="space-y-8">
            {MILESTONES.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-4 h-4 bg-teal-600 rounded-full"></div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 md:ml-6">
                      <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-sm font-medium rounded-full">
                        {new Date(milestone.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Subscribe */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Get In Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-teal-600 dark:text-teal-400">✉️</span>
                  <span className="text-gray-600 dark:text-gray-300">editorial@bali.report</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-teal-600 dark:text-teal-400">📧</span>
                  <span className="text-gray-600 dark:text-gray-300">contribute@bali.report</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-teal-600 dark:text-teal-400">📱</span>
                  <span className="text-gray-600 dark:text-gray-300">@BaliReport (X/Twitter)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-teal-600 dark:text-teal-400">💬</span>
                  <span className="text-gray-600 dark:text-gray-300">t.me/balireport (Telegram)</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  For Contributors
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We welcome op-eds, analysis pieces, and news tips from BRICS nations and Global South. 
                  Pitch your ideas to our editorial team.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">
                Support Independent Media
              </h3>
              <p className="mb-6 text-teal-100">
                Help us maintain editorial independence and support BPD development projects 
                across BRICS nations.
              </p>
              <div className="space-y-4">
                <button className="w-full bg-white text-teal-600 font-semibold py-3 px-6 rounded-md hover:bg-gray-100 transition-colors">
                  Subscribe ($2-5/month)
                </button>
                <button className="w-full border-2 border-white text-white font-semibold py-3 px-6 rounded-md hover:bg-white hover:text-teal-600 transition-colors">
                  One-Time Donation
                </button>
              </div>
              <p className="mt-4 text-xs text-teal-100 text-center">
                20% of subscription revenue goes directly to BPD projects
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}