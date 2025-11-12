'use client';

import { useState, useEffect } from 'react';
import { Step1Form } from '@/components/onboarding/Step1Form';
import { Step2Form } from '@/components/onboarding/Step2Form';
import { InsightsPanel } from '@/components/onboarding/InsightsPanel';
import { useGooglePlaces } from '@/lib/hooks/useGooglePlaces';
import type { LocalInsights } from '@/lib/insights/queries';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [insights, setInsights] = useState<LocalInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const { isLoaded: mapsLoaded, error: mapsError } = useGooglePlaces();

  // Step 1 data
  const [step1Data, setStep1Data] = useState({
    storeName: '',
    address: '',
    placeId: '',
    lat: 0,
    lng: 0,
    storeType: '',
    hours: '',
    email: '',
    phone: '',
  });

  if (mapsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{mapsError}</p>
        </div>
      </div>
    );
  }

  if (!mapsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-emerald-900">
                Join RepRally
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of 2
              </p>
            </div>
            <div className="flex gap-2">
              <div className={`h-2 w-20 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              <div className={`h-2 w-20 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {step === 1 && (
                <Step1Form
                  sessionId={sessionId}
                  initialData={step1Data}
                  onComplete={(data) => {
                    setStep1Data(data);
                    setStep(2);
                  }}
                  onInsightsRequest={(lat, lng, storeType) => {
                    setLoadingInsights(true);
                    fetch('/api/insights', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ lat, lng, storeType }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.success) {
                          setInsights(data.insights);
                        }
                      })
                      .catch(console.error)
                      .finally(() => setLoadingInsights(false));
                  }}
                />
              )}

              {step === 2 && (
                <Step2Form
                  sessionId={sessionId}
                  onBack={() => setStep(1)}
                  onComplete={() => {
                    // Show success message or redirect
                    alert('Onboarding complete! We\'ll be in touch soon.');
                  }}
                />
              )}
            </div>
          </div>

          {/* Insights Column */}
          <div className="lg:col-span-1">
            <InsightsPanel 
              insights={insights} 
              loading={loadingInsights}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

