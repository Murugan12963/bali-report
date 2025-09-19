'use client';

import { useState, useEffect } from 'react';
import { userPreferencesManager, UserTopics, UserLocation } from '@/lib/user-preferences';

interface TopicSelectorProps {
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * Topic Selector Modal for personalized content preferences.
 * Shows on first visit to customize user's news interests.
 */
export default function TopicSelector({ isVisible, onComplete }: TopicSelectorProps) {
  const [selectedTopics, setSelectedTopics] = useState<UserTopics>({
    'BRICS Economy': false,
    'BRICS Politics': false,
    'Indonesia Politics': false,
    'Indonesia Economy': false,
    'Bali Tourism': false,
    'Bali Events': false,
    'Bali Culture': false,
    'Southeast Asia': false,
    'Geopolitics': false,
    'Trade & Business': false,
  });

  const [userType, setUserType] = useState<UserLocation['type']>('unknown');
  const [currentStep, setCurrentStep] = useState<'welcome' | 'location' | 'topics' | 'complete'>('welcome');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Topic categories for better organization
  const topicCategories = {
    '🌺 BRICS Paradise': ['BRICS Economy', 'BRICS Politics', 'Geopolitics', 'Trade & Business'],
    '🏝️ Indonesia Islands': ['Indonesia Politics', 'Indonesia Economy', 'Southeast Asia'],
    '⛩️ Sacred Bali': ['Bali Tourism', 'Bali Events', 'Bali Culture'],
  };

  // User type descriptions
  const userTypeDescriptions = {
    tourist: '🌺 Tourist - Visiting Bali for vacation',
    expat: '🏝️ Expat - Living in Indonesia/Bali',
    local: '⛩️ Local - Indonesian resident',
    global: '🌍 Global - International BRICS perspective',
    unknown: '🤔 Not sure / Prefer not to say',
  };

  useEffect(() => {
    // Load existing preferences if any
    const preferences = userPreferencesManager.loadPreferences();
    if (!preferences.isFirstVisit) {
      setSelectedTopics(preferences.topics);
      setUserType(preferences.location.type);
    }
  }, []);

  /**
   * Handle geolocation detection.
   */
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false,
          });
        });

        // Simple location-based user type detection
        // Note: This is a basic implementation. In production, you'd use a proper geolocation service
        const { latitude, longitude } = position.coords;
        
        // Rough coordinates for Indonesia/Bali region
        if (latitude >= -11 && latitude <= 6 && longitude >= 95 && longitude <= 141) {
          setUserType('local');
          userPreferencesManager.updateLocation({
            type: 'local',
            region: 'indonesia',
            detected: true,
          });
        } else {
          setUserType('global');
          userPreferencesManager.updateLocation({
            type: 'global',
            region: 'global',
            detected: true,
          });
        }
      }
    } catch (error) {
      console.log('Location detection failed or denied:', error);
      // Fallback to manual selection
    }
    
    setIsDetectingLocation(false);
  };

  /**
   * Handle topic selection toggle.
   */
  const toggleTopic = (topic: keyof UserTopics) => {
    setSelectedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  /**
   * Handle user type selection.
   */
  const selectUserType = (type: UserLocation['type']) => {
    setUserType(type);
    userPreferencesManager.updateLocation({ type });
  };

  /**
   * Save preferences and complete setup.
   */
  const completeSetup = () => {
    // Save topic preferences
    userPreferencesManager.updateTopics(selectedTopics);
    
    // Mark setup as completed
    userPreferencesManager.completeSetup();
    
    console.log('🎉 Personalization setup completed!');
    console.log('Selected topics:', Object.entries(selectedTopics).filter(([_, selected]) => selected));
    console.log('User type:', userType);
    
    onComplete();
  };

  /**
   * Get smart topic recommendations based on user type.
   */
  const getRecommendedTopics = (): (keyof UserTopics)[] => {
    switch (userType) {
      case 'tourist':
        return ['Bali Tourism', 'Bali Events', 'Bali Culture'];
      case 'expat':
        return ['Indonesia Politics', 'Indonesia Economy', 'Bali Events', 'Southeast Asia'];
      case 'local':
        return ['Indonesia Politics', 'Indonesia Economy', 'Southeast Asia'];
      case 'global':
        return ['BRICS Politics', 'BRICS Economy', 'Geopolitics', 'Trade & Business'];
      default:
        return ['BRICS Economy', 'Indonesia Politics', 'Bali Tourism'];
    }
  };

  /**
   * Apply recommended topics based on user type.
   */
  const applyRecommendations = () => {
    const recommended = getRecommendedTopics();
    const newTopics = { ...selectedTopics };
    
    recommended.forEach(topic => {
      newTopics[topic] = true;
    });
    
    setSelectedTopics(newTopics);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden theme-transition">
        
        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🌺</div>
            <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-4 theme-transition">
              Welcome to Paradise! 🏝️
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 theme-transition">
              Let's personalize your tropical news experience! We'll show you content 
              that matches your interests from our sacred BRICS and Indonesian sources.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep('location')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
              >
                🌊 Start Personalization Journey
              </button>
              <button
                onClick={completeSetup}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 theme-transition"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Location Step */}
        {currentStep === 'location' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-6 theme-transition">
              🗺️ Tell us about yourself
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 theme-transition">
              This helps us prioritize relevant content for you.
            </p>
            
            <div className="space-y-3 mb-6">
              {Object.entries(userTypeDescriptions).map(([type, description]) => (
                <button
                  key={type}
                  onClick={() => selectUserType(type as UserLocation['type'])}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    userType === type
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } theme-transition`}
                >
                  {description}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isDetectingLocation ? '🔍 Detecting...' : '📍 Auto-detect Location'}
              </button>
              <button
                onClick={() => setCurrentStep('topics')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Next: Choose Topics 🌺
              </button>
            </div>
          </div>
        )}

        {/* Topics Step */}
        {currentStep === 'topics' && (
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-4 theme-transition">
              🌺 Choose Your Interests
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 theme-transition">
              Select topics you want to see more of. We'll prioritize articles that match your interests.
            </p>

            {/* Recommendations */}
            {userType !== 'unknown' && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 theme-transition">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 theme-transition">
                  ✨ Recommended for {userTypeDescriptions[userType].split(' - ')[0]}:
                </h3>
                <button
                  onClick={applyRecommendations}
                  className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition-colors duration-200"
                >
                  Apply Recommendations
                </button>
              </div>
            )}

            {/* Topic Categories */}
            <div className="space-y-6">
              {Object.entries(topicCategories).map(([category, topics]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 theme-transition">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topics.map((topic) => (
                      <label
                        key={topic}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedTopics[topic as keyof UserTopics]
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-600'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        } border theme-transition`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTopics[topic as keyof UserTopics]}
                          onChange={() => toggleTopic(topic as keyof UserTopics)}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition">
                          {topic}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setCurrentStep('location')}
                className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 theme-transition"
              >
                ← Back
              </button>
              <button
                onClick={completeSetup}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
              >
                🎉 Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}