'use client';

import { useState } from 'react';
import { completeOnboarding } from '@/app/actions/onboarding';

interface Step2FormProps {
  sessionId: string;
  onBack: () => void;
  onComplete: () => void;
}

const CONTACT_METHODS = ['Email', 'Phone', 'Text', 'Any'];
const BEST_TIMES = ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime'];

export function Step2Form({ sessionId, onBack, onComplete }: Step2FormProps) {
  const [formData, setFormData] = useState({
    whatsSelling: '',
    productsExcited: '',
    bestTime: '',
    contactMethod: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await completeOnboarding({
        sessionId,
        whatsSelling: formData.whatsSelling,
        productsExcitedAbout: formData.productsExcited,
        bestTimeToReach: formData.bestTime,
        preferredContactMethod: formData.contactMethod,
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
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
          What's selling well right now?
        </label>
        <textarea
          id="whatsSelling"
          value={formData.whatsSelling}
          onChange={(e) => setFormData({ ...formData, whatsSelling: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Tell us about your top products, popular categories, or seasonal items..."
        />
      </div>

      {/* Products Excited About */}
      <div>
        <label htmlFor="productsExcited" className="block text-sm font-medium text-gray-700 mb-1">
          What products are you excited to carry?
        </label>
        <textarea
          id="productsExcited"
          value={formData.productsExcited}
          onChange={(e) => setFormData({ ...formData, productsExcited: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="New brands you want to stock, categories you're expanding into..."
        />
      </div>

      {/* Best Time to Reach */}
      <div>
        <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-1">
          Best time to reach you
        </label>
        <select
          id="bestTime"
          value={formData.bestTime}
          onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          style={{ backgroundPosition: 'right 0.75rem center' }}
        >
          <option value="">Select a time...</option>
          {BEST_TIMES.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred contact method
        </label>
        <select
          id="contactMethod"
          value={formData.contactMethod}
          onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          style={{ backgroundPosition: 'right 0.75rem center' }}
        >
          <option value="">Select a method...</option>
          {CONTACT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Complete Onboarding'}
        </button>
      </div>
    </form>
  );
}

