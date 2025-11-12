'use client';

import { useState, useEffect, useRef } from 'react';
import { initAutocomplete, PlaceResult } from '@/lib/hooks/useGooglePlaces';
import { saveOnboardingDraft } from '@/app/actions/onboarding';

interface Step1FormProps {
  sessionId: string;
  initialData: {
    storeName: string;
    address: string;
    placeId: string;
    lat: number;
    lng: number;
    storeType: string;
    hours: string;
    email: string;
    phone: string;
  };
  onComplete: (data: any) => void;
}

const STORE_TYPES = [
  'convenience',
  'grocery',
  'foodservice',
  'liquor',
  'gas',
  'other',
];

export function Step1Form({ sessionId, initialData, onComplete }: Step1FormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addressInputRef.current && window.google?.maps?.places) {
      const autocomplete = initAutocomplete(
        addressInputRef.current,
        (place: PlaceResult) => {
          setFormData((prev) => ({
            ...prev,
            address: place.formattedAddress,
            placeId: place.placeId,
            lat: place.lat,
            lng: place.lng,
          }));
        }
      );

      return () => {
        if (autocomplete) {
          window.google.maps.event.clearInstanceListeners(autocomplete);
        }
      };
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.storeType) {
      newErrors.storeType = 'Store type is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      await saveOnboardingDraft({
        sessionId,
        storeName: formData.storeName,
        googlePlaceId: formData.placeId,
        formattedAddress: formData.address,
        latitude: formData.lat,
        longitude: formData.lng,
        storeType: formData.storeType,
        hours: formData.hours,
        ownerEmail: formData.email,
        ownerPhone: formData.phone,
      });

      onComplete(formData);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Tell us about your store
        </h2>
        <p className="text-gray-600">
          We'll show you what's happening in your local market
        </p>
      </div>

      {/* Store Name */}
      <div>
        <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
          Store Name *
        </label>
        <input
          id="storeName"
          type="text"
          value={formData.storeName}
          onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.storeName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Joe's Corner Store"
        />
        {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Store Address *
        </label>
        <input
          ref={addressInputRef}
          id="address"
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Start typing your address..."
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        <p className="text-xs text-gray-500 mt-1">Select from dropdown for best results</p>
      </div>

      {/* Store Type */}
      <div>
        <label htmlFor="storeType" className="block text-sm font-medium text-gray-700 mb-1">
          Store Type *
        </label>
        <select
          id="storeType"
          value={formData.storeType}
          onChange={(e) => {
            setFormData({ ...formData, storeType: e.target.value });
          }}
          className={`w-full pl-4 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat ${
            errors.storeType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a type...</option>
          {STORE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        {errors.storeType && <p className="text-red-500 text-sm mt-1">{errors.storeType}</p>}
      </div>

      {/* Hours */}
      <div>
        <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
          Store Hours
        </label>
        <input
          id="hours"
          type="text"
          value={formData.hours}
          onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="e.g., Mon-Fri 8am-8pm, Sat-Sun 9am-6pm"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Your Email *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Continue to Step 2'}
        </button>
      </div>
    </form>
  );
}

