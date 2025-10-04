'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Event, MOCK_EVENTS, MOCK_TICKETS } from '@/types/event';
import EventTickets from '@/components/events/EventTickets';

const categoryEmojis = {
  conference: '🏛️',
  webinar: '💻',
  workshop: '🔨',
  cultural: '🎭',
  networking: '🤝'
};

export default function EventDetailPage() {
  const params = useParams();
  const event = MOCK_EVENTS.find(e => e.id === params.id);
  
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const eventTickets = MOCK_TICKETS.filter(ticket => ticket.eventId === event.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-96">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
            <span className="text-8xl mb-4">{categoryEmojis[event.category]}</span>
            <span className="text-white text-xl font-medium capitalize opacity-80">
              {event.category}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-gray-200 mb-6">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg px-4 py-2">
                  <div className="text-white">
                    <span className="mr-2">📅</span>
                    {new Date(event.date).toLocaleDateString()}
                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg px-4 py-2">
                  <div className="text-white">
                    <span className="mr-2">📍</span>
                    {event.location}
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg px-4 py-2">
                  <div className="text-white">
                    <span className="mr-2">👥</span>
                    {event.capacity - event.ticketsSold} spots remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Event Details */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                About This Event
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300">
                  {event.description}
                </p>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Event Agenda
                </h2>
                <div className="space-y-6">
                  {event.agenda.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
                    >
                      <div className="w-24 flex-shrink-0">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.time}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Speakers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="flex gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0">
                        {speaker.image ? (
                          <Image
                            src={speaker.image}
                            alt={speaker.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">
                              {speaker.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {speaker.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {speaker.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {speaker.organization}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <EventTickets tickets={eventTickets} eventTitle={event.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}