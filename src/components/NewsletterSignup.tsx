'use client';

import React, { useState, useCallback } from 'react';
import { 
  Mail, 
  User, 
  MapPin, 
  Heart, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Sparkles,
  Globe
} from 'lucide-react';

export interface NewsletterSignupProps {
  variant?: 'hero' | 'sidebar' | 'footer' | 'floating' | 'inline';
  showInterests?: boolean;
  className?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  interests: string[];
  source: string;
}

/**
 * Newsletter signup component with modern Grok-inspired theming.
 * 
 * Args:
 *   variant (string): Display variant (hero, sidebar, footer, floating, inline).
 *   showInterests (boolean): Show interests selection.
 *   className (string): Additional CSS classes.
 *   onSuccess (function): Callback on successful subscription.
 *   onError (function): Callback on subscription error.
 */
export function NewsletterSignup({ 
  variant = 'inline',
  showInterests = true,
  className = '',
  onSuccess,
  onError
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    location: '',
    interests: [],
    source: variant
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Interest options with clean design
  const interestOptions = [
    { id: 'brics-news', label: 'BRICS & Global Politics', value: 'brics-news' },
    { id: 'indonesia-news', label: 'Indonesia News', value: 'indonesia-news' },
    { id: 'bali-events', label: 'Bali Events & Culture', value: 'bali-events' },
    { id: 'tourism', label: 'Tourism & Travel', value: 'tourism' },
    { id: 'economy', label: 'Economy & Business', value: 'economy' },
    { id: 'environment', label: 'Environment & Sustainability', value: 'environment' }
  ];

  /**
   * Handle form field changes.
   */
  const handleChange = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Handle interest selection.
   */
  const handleInterestToggle = useCallback((interestValue: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestValue)
        ? prev.interests.filter(i => i !== interestValue)
        : [...prev.interests, interestValue]
    }));
  }, []);

  /**
   * Submit newsletter subscription.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setStatus('error');
      setMessage('Email address is required.');
      onError?.('Email address is required.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        onSuccess?.(formData.email);
        
        // Reset form on success
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          location: '',
          interests: [],
          source: variant
        });
      } else {
        setStatus('error');
        setMessage(result.message);
        onError?.(result.message);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setMessage('Unable to subscribe. Please try again later.');
      onError?.('Unable to subscribe. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Variant-specific styling - Grok-inspired
  const getVariantClasses = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700',
          title: 'text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4',
          description: 'text-zinc-600 dark:text-zinc-400 mb-6',
          form: 'space-y-4'
        };
      case 'sidebar':
        return {
          container: 'bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700',
          title: 'text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3',
          description: 'text-sm text-zinc-600 dark:text-zinc-400 mb-4',
          form: 'space-y-3'
        };
      case 'footer':
        return {
          container: 'bg-zinc-800 dark:bg-zinc-900 rounded-xl p-6 text-white',
          title: 'text-xl font-bold mb-3 text-zinc-100',
          description: 'text-zinc-300 mb-4',
          form: 'space-y-3'
        };
      case 'floating':
        return {
          container: 'fixed bottom-4 left-4 bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-700 max-w-sm z-40',
          title: 'text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2',
          description: 'text-xs text-zinc-600 dark:text-zinc-400 mb-3',
          form: 'space-y-2'
        };
      default: // inline
        return {
          container: 'bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700',
          title: 'text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3',
          description: 'text-zinc-600 dark:text-zinc-400 mb-4',
          form: 'space-y-3'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={`${variantClasses.container} ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={variantClasses.title}>
            Stay Updated
          </h3>
        </div>
      </div>

      <p className={variantClasses.description}>
        Get the latest multi-polar news and insights delivered to your inbox. 
        Join our community for BRICS, Indonesia, and Bali coverage.
      </p>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg mb-4">
          <CheckCircle size={20} />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg mb-4">
          <XCircle size={20} />
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className={variantClasses.form}>
        {/* Email Input */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="
              w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-700 
              border border-zinc-300 dark:border-zinc-600 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              text-zinc-900 dark:text-zinc-100
              transition-all duration-200
            "
          />
        </div>

        {/* Name Fields - Two Column Layout */}
        {variant !== 'floating' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="
                  w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-700 
                  border border-zinc-300 dark:border-zinc-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  text-zinc-900 dark:text-zinc-100
                  transition-all duration-200
                "
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Location (optional)"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="
                  w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-700 
                  border border-zinc-300 dark:border-zinc-600 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  text-zinc-900 dark:text-zinc-100
                  transition-all duration-200
                "
              />
            </div>
          </div>
        )}

        {/* Interests Selection */}
        {showInterests && variant !== 'floating' && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              <Heart className="inline w-4 h-4 mr-1" />
              What interests you? (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {interestOptions.map((interest) => (
                <label
                  key={interest.id}
                  className={`
                    flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${formData.interests.includes(interest.value)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
                      : 'bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest.value)}
                    onChange={() => handleInterestToggle(interest.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{interest.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.email}
          className={`
            w-full flex items-center justify-center gap-2 px-6 py-3 
            bg-blue-600 hover:bg-blue-700 
            disabled:bg-zinc-400 disabled:dark:bg-zinc-600 
            text-white font-semibold rounded-lg 
            transition-all duration-200 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isLoading ? 'cursor-not-allowed' : ''}
            shadow-sm hover:shadow-md
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Subscribe
            </>
          )}
        </button>

        {/* Privacy Notice */}
        {variant !== 'floating' && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            We respect your privacy. Unsubscribe anytime. 
            <br />
            Powered by Mailchimp
          </p>
        )}
      </form>
    </div>
  );
}

/**
 * Floating newsletter signup that can be dismissed.
 */
export function FloatingNewsletterSignup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show after 10 seconds, hide if dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem('newsletter-floating-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('newsletter-floating-dismissed', 'true');
  };

  const handleSuccess = () => {
    setIsVisible(false);
    // Don't permanently dismiss on success - they might want to subscribe again
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10"
          aria-label="Close newsletter signup"
        >
          ×
        </button>
        <NewsletterSignup 
          variant="floating"
          showInterests={false}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}

/**
 * Compact newsletter signup for sidebars.
 */
export function CompactNewsletterSignup({ className = '' }: { className?: string }) {
  return (
    <NewsletterSignup 
      variant="sidebar"
      showInterests={false}
      className={className}
    />
  );
}

/**
 * Hero newsletter signup for main pages.
 */
export function HeroNewsletterSignup({ className = '' }: { className?: string }) {
  return (
    <NewsletterSignup 
      variant="hero"
      showInterests={true}
      className={className}
    />
  );
}