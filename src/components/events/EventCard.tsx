'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
}

const categoryColors = {
  conference: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  webinar: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  workshop: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cultural: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  networking: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
};

const formatColors = {
  'in-person': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  virtual: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  hybrid: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
};

export default function EventCard({ event }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  const ticketsRemaining = event.capacity - event.ticketsSold;
  const soldOutPercentage = (event.ticketsSold / event.capacity) * 100;
  const isAlmostSoldOut = soldOutPercentage >= 80;
  const isSoldOut = event.ticketsSold >= event.capacity;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <div className="relative h-48 w-full">
          {!imageError && event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-4xl">🎪</span>
            </div>
          )}
          {event.featured && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-4 flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[event.category]}`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${formatColors[event.format]}`}>
            {event.format.charAt(0).toUpperCase() + event.format.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="mr-2">📅</span>
              {new Date(event.date).toLocaleDateString()}
              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="mr-2">📍</span>
              {event.location}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">
                {ticketsRemaining} tickets remaining
              </span>
              <span
                className={`font-medium ${
                  isAlmostSoldOut
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {isSoldOut ? 'Sold Out' : `${Math.round(soldOutPercentage)}% Sold`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  isAlmostSoldOut
                    ? 'bg-orange-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(100, soldOutPercentage)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${event.price}
            </div>
            <Link
              href={`/events/${event.id}`}
              className={`px-4 py-2 rounded-md text-white ${
                isSoldOut
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSoldOut ? 'Sold Out' : 'Get Tickets'}
            </Link>
          </div>

          {event.speakers && event.speakers.length > 0 && (
            <div className="flex items-center space-x-2 mt-4">
              <div className="flex -space-x-2">
                {event.speakers.slice(0, 3).map((speaker, index) => (
                  <div
                    key={index}
                    className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800"
                  >
                    {speaker.image ? (
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-sm">
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {event.speakers.length} Speaker{event.speakers.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}