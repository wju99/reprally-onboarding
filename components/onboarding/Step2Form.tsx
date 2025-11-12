'use client';

import { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { completeOnboarding } from '@/app/actions/onboarding';

interface Step2FormProps {
  sessionId: string;
  onBack: () => void;
  onComplete: () => void;
}

const CONTACT_METHODS = ['Email', 'Phone', 'Text', 'Any'];
const BEST_TIMES = ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime'];

export function Step2Form({ sessionId, onBack, onComplete }: Step2FormProps) {
  const posthog = usePostHog();
  const [formData, setFormData] = useState({
    whatsSelling: '',
    productsExcited: '',
    bestTime: '',
    contactMethod: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track step 2 view
  useEffect(() => {
    if (!hasTrackedView) {
      posthog?.capture('onboarding_step2_viewed', {
        session_id: sessionId,
      });
      setHasTrackedView(true);
    }
  }, [posthog, sessionId, hasTrackedView]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.whatsSelling.trim()) {
      newErrors.whatsSelling = 'Please tell us what\'s selling well';
    } else if (formData.whatsSelling.trim().length < 2) {
      newErrors.whatsSelling = 'Please provide at least 2 characters';
    }

    if (!formData.productsExcited.trim()) {
      newErrors.productsExcited = 'Please tell us what products you\'re excited about';
    } else if (formData.productsExcited.trim().length < 2) {
      newErrors.productsExcited = 'Please provide at least 2 characters';
    }

    if (!formData.bestTime) {
      newErrors.bestTime = 'Please select your preferred time';
    }

    if (!formData.contactMethod) {
      newErrors.contactMethod = 'Please select your preferred contact method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Track validation errors
      posthog?.capture('onboarding_step2_validation_failed', {
        session_id: sessionId,
        error_fields: Object.keys(errors),
      });
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        sessionId,
        whatsSelling: formData.whatsSelling,
        productsExcitedAbout: formData.productsExcited,
        bestTimeToReach: formData.bestTime,
        preferredContactMethod: formData.contactMethod,
      });

      // Track successful completion
      posthog?.capture('onboarding_step2_completed', {
        session_id: sessionId,
        best_time: formData.bestTime,
        contact_method: formData.contactMethod,
      });

      posthog?.capture('onboarding_completed', {
        session_id: sessionId,
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      // Track submission error
      posthog?.capture('onboarding_step2_submit_failed', {
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          What's working in your store?
        </h2>
        <p className="text-gray-600">
          Help us understand your business so we can serve you better
        </p>
      </div>

      {/* What's Selling */}
      <div>
        <label htmlFor="whatsSelling" className="block text-sm font-medium text-gray-700 mb-1">
          What's selling well right now? *
        </label>
        <textarea
          id="whatsSelling"
          value={formData.whatsSelling}
          onChange={(e) => setFormData({ ...formData, whatsSelling: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.whatsSelling ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Tell us about your top products, popular categories, or seasonal items..."
          required
          minLength={2}
        />
        {errors.whatsSelling && <p className="text-red-500 text-sm mt-1">{errors.whatsSelling}</p>}
      </div>

      {/* Products Excited About */}
      <div>
        <label htmlFor="productsExcited" className="block text-sm font-medium text-gray-700 mb-1">
          What products are you excited to carry? *
        </label>
        <textarea
          id="productsExcited"
          value={formData.productsExcited}
          onChange={(e) => setFormData({ ...formData, productsExcited: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.productsExcited ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="New brands you want to stock, categories you're expanding into..."
          required
          minLength={2}
        />
        {errors.productsExcited && <p className="text-red-500 text-sm mt-1">{errors.productsExcited}</p>}
      </div>

      {/* Best Time to Reach */}
      <div>
        <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-1">
          Best time to reach you *
        </label>
        <select
          id="bestTime"
          value={formData.bestTime}
          onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
          className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.bestTime ? 'border-red-500' : 'border-gray-300'
          }`}
          style={{ backgroundPosition: 'right 0.75rem center' }}
          required
        >
          <option value="">Select a time...</option>
          {BEST_TIMES.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        {errors.bestTime && <p className="text-red-500 text-sm mt-1">{errors.bestTime}</p>}
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred contact method *
        </label>
        <select
          id="contactMethod"
          value={formData.contactMethod}
          onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
          className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.contactMethod ? 'border-red-500' : 'border-gray-300'
          }`}
          style={{ backgroundPosition: 'right 0.75rem center' }}
          required
        >
          <option value="">Select a method...</option>
          {CONTACT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        {errors.contactMethod && <p className="text-red-500 text-sm mt-1">{errors.contactMethod}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-heading font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-sm"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-emerald-600 text-white font-heading font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {submitting ? 'Submitting...' : 'Complete Onboarding'}
        </button>
      </div>
    </form>
  );
}

  