'use client';

import { useEffect, useState } from 'react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

export interface PlaceResult {
  placeId: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

export function useGooglePlaces() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError('Google Maps API key not configured');
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.initGoogleMaps = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      delete window.initGoogleMaps;
    };
  }, []);

  return { isLoaded, error };
}

/**
 * Initialize autocomplete on an input element
 */
export function initAutocomplete(
  input: HTMLInputElement,
  onPlaceSelected: (place: PlaceResult) => void
) {
  if (!window.google?.maps?.places) {
    console.error('Google Places not loaded');
    return null;
  }

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: 'us' },
    fields: ['place_id', 'formatted_address', 'geometry'],
    types: ['address'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();

    if (!place.geometry?.location) {
      console.error('No geometry for place');
      return;
    }

    onPlaceSelected({
      placeId: place.place_id!,
      formattedAddress: place.formatted_address!,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  });

  return autocomplete;
}

