'use client';

import { useState } from 'react';
import EventCard from '@/components/events/EventCard';
import { Event, MOCK_EVENTS } from '@/types/event';

interface EventFilters {
  category?: Event['category'];
  format?: Event['format'];
  country?: Event['country'];
  searchQuery?: string;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const countryFlags = {
  'Brazil': '🇧🇷',
  'Russia': '🇷🇺',
  'India': '🇮🇳',
  'China': '🇨🇳',
  'South Africa': '🇿🇦',
  'Indonesia': '🇮🇩',
  'Iran': '🇮🇷',
  'UAE': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Egypt': '🇪🇬',
  'Ethiopia': '🇪🇹',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'Malaysia': '🇲🇾',
  'Online': '🌐'
};

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFilters>({});

  const categories: Event['category'][] = ['conference', 'webinar', 'workshop', 'cultural', 'networking'];
  const formats: Event['format'][] = ['in-person', 'virtual', 'hybrid'];
  const countries: Event['country'][] = ['Brazil', 'Russia', 'India', 'China', 'South Africa', 'Indonesia', 'Iran', 'UAE', 'Saudi Arabia', 'Egypt', 'Ethiopia', 'Thailand', 'Vietnam', 'Malaysia', 'Online'];

  const filteredEvents = MOCK_EVENTS.filter(event => {
    if (filters.category && event.category !== filters.category) {
      return false;
    }
    if (filters.format && event.format !== filters.format) {
      return false;
    }
    if (filters.country && event.country !== filters.country) {
      return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const upcomingEvents = filteredEvents.length;
  const totalCapacity = filteredEvents.reduce((sum, event) => sum + event.capacity, 0);
  const totalTicketsSold = filteredEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
  const uniqueCountries = new Set(filteredEvents.map(event => event.country)).size;
  
  // Country breakdown for the current filtered events
  const countryBreakdown = filteredEvents.reduce((acc, event) => {
    const country = event.country;
    if (!acc[country]) {
      acc[country] = 0;
    }
    acc[country]++;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedCountries = Object.entries(countryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8); // Top 8 countries

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Add bottom padding for mobile PWA navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            BRICS Global Events
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover events across all BRICS member states focusing on sustainable development, 
            technology, cultural exchange, and economic cooperation. From Brazil to China, 
            India to South Africa, and beyond.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {upcomingEvents}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Upcoming Events</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {uniqueCountries}
            </div>
            <div className="text-gray-600 dark:text-gray-300">BRICS Nations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {totalCapacity}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Total Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {totalTicketsSold}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Tickets Sold</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: (e.target.value || undefined) as Event['category']
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={filters.format || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  format: (e.target.value || undefined) as Event['format']
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Formats</option>
                {formats.map(format => (
                  <option key={format} value={format}>
                    {format.charAt(0).toUpperCase() + format.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country
              </label>
              <select
                value={filters.country || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  country: (e.target.value || undefined) as Event['country']
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search events..."
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  searchQuery: e.target.value || undefined
                }))}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Country Breakdown */}
        {sortedCountries.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Events by BRICS Nations
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {sortedCountries.map(([country, count]) => (
                  <div 
                    key={country} 
                    className={`text-center p-3 rounded-lg transition-all cursor-pointer hover:scale-105 ${
                      filters.country === country 
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      country: filters.country === country ? undefined : country as Event['country']
                    }))}
                  >
                    <div className="text-2xl mb-1">{countryFlags[country as keyof typeof countryFlags] || '🏛️'}</div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {country === 'Online' ? 'Virtual' : country}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {count} event{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Events */}
        {filteredEvents.some(event => event.featured) && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Events
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredEvents
                .filter(event => event.featured)
                .map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </section>
        )}

        {/* All Events */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents
              .filter(event => !event.featured)
              .map(event => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </section>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No events found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}