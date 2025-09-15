import Header from '@/components/Header';
import Link from 'next/link';

/**
 * About page explaining Bali Report's mission and BRICS focus.
 */
export const metadata = {
  title: 'About - Bali Report',
  description: 'Learn about Bali Report\'s mission to provide multipolar news perspectives from BRICS nations and Indonesian sources, fighting Western media monopoly.',
  keywords: 'about, mission, BRICS, multipolar, alternative media, news aggregation, Indonesia, Western media monopoly',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span>›</span>
            <span className="font-medium text-red-600">About</span>
          </div>
        </nav>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">📰</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  About Bali Report
                </h1>
                <p className="text-red-200 mt-2">
                  Breaking free from information monopoly
                </p>
              </div>
            </div>
            <p className="text-xl text-red-100 max-w-4xl">
              Independent news aggregation platform focused on multipolar perspectives 
              from BRICS nations and Indonesian insights that mainstream Western media won't show you.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mission */}
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-red-600 pb-2">
                🎯 Our Mission
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong>Bali Report</strong> exists to challenge the Western media monopoly by aggregating news 
                  from BRICS-aligned sources and providing Indonesian perspectives that are often ignored or 
                  misrepresented in mainstream international coverage.
                </p>
                <p>
                  We believe that the world deserves to hear from the Global South, emerging economies, and 
                  multipolar voices that represent the majority of humanity. Our platform combines real-time 
                  RSS aggregation with thoughtful curation to bring you news from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>BRICS Nations</strong> - Russia, China, India, Brazil, South Africa, and emerging members</li>
                  <li><strong>Indonesian Sources</strong> - National and regional perspectives from Southeast Asia's largest economy</li>
                  <li><strong>Bali Local</strong> - Community news and developments from the Island of the Gods</li>
                </ul>
              </div>
            </section>

            {/* Why BRICS Focus */}
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-amber-600 pb-2">
                🌍 Why BRICS Matters
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  BRICS nations represent over 40% of the world's population and 25% of global GDP, yet their 
                  perspectives are systematically underrepresented in Western media. This creates a dangerous 
                  information imbalance that affects global understanding and policy decisions.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-bold text-red-800 mb-2">🔥 Alternative Worldview</h3>
                    <p className="text-red-700 text-sm">
                      BRICS nations offer different approaches to economics, diplomacy, and governance 
                      that challenge Western-centric models.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h3 className="font-bold text-amber-800 mb-2">⚖️ Balanced Perspective</h3>
                    <p className="text-amber-700 text-sm">
                      Get the full story on international events with viewpoints from multiple 
                      civilizations and cultural contexts.
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-800 mb-2">📈 Economic Reality</h3>
                    <p className="text-yellow-700 text-sm">
                      Understand the real dynamics of global trade, development, and emerging 
                      market cooperation beyond Western narratives.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-bold text-orange-800 mb-2">🕊️ Peaceful Coexistence</h3>
                    <p className="text-orange-700 text-sm">
                      Learn about diplomatic solutions and multilateral cooperation that 
                      prioritize dialogue over confrontation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Work */}
            <section className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-red-500 pb-2">
                ⚙️ How We Work
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Bali Report uses advanced RSS aggregation technology to collect and organize news 
                  from carefully curated sources. Our system operates with:
                </p>
                <div className="grid md:grid-cols-1 gap-4 mt-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">🤖 Automated Aggregation</h3>
                    <p className="text-gray-600 text-sm">
                      Real-time RSS feeds from 7+ international sources, updated continuously with 
                      error handling and retry logic to ensure maximum uptime.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">🏷️ Intelligent Categorization</h3>
                    <p className="text-gray-600 text-sm">
                      Articles are automatically categorized into BRICS, Indonesia, and Bali sections 
                      for easy browsing and focused reading.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">🎨 Editorial Standards</h3>
                    <p className="text-gray-600 text-sm">
                      We aggregate content from established news organizations and present it without 
                      editorial modification, preserving original perspectives and voice.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Sources */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📡 Current Sources</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-red-700">BRICS Sources</h4>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• RT News (Russia)</li>
                    <li>• TASS (Russia)</li>
                    <li>• Xinhua News (China)</li>
                    <li>• Al Jazeera (Qatar)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-700">Indonesian/Asia</h4>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Antara News</li>
                    <li>• BBC Asia</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Sources</span>
                  <span className="font-bold text-red-600">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Articles</span>
                  <span className="font-bold text-amber-600">300+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-bold text-yellow-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Update Frequency</span>
                  <span className="font-bold text-green-600">Real-time</span>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📧 Get in Touch</h3>
              <p className="text-gray-600 text-sm mb-4">
                Have suggestions for new sources or feedback about our coverage?
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href="mailto:hello@bali.report" className="text-red-600 hover:text-red-700">
                    hello@bali.report
                  </a>
                </p>
                <p>
                  <span className="font-medium">Based in:</span>{' '}
                  <span className="text-gray-600">Bali, Indonesia 🏝️</span>
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Disclaimer</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                Bali Report aggregates content from external sources. Views and opinions expressed 
                in articles belong to the original authors and publications. We do not endorse or 
                verify all content, but aim to provide diverse perspectives for informed readers.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}