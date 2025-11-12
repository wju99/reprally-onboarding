'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InsightsPanel } from '@/components/onboarding/InsightsPanel';
import type { LocalInsights } from '@/lib/insights/queries';
import Link from 'next/link';

// Helper function to get proper ordinal suffix
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}

// Helper function to format store type labels
function formatStoreType(type: string): string {
  const formatted = type
    .replace(/tobacco_smoke/gi, 'Tobacco / Smoke')
    .replace(/foodservice/gi, 'Food Service');
  
  // Capitalize first letter if not already formatted
  if (formatted === type) {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  }
  
  return formatted;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [insights, setInsights] = useState<LocalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const name = searchParams.get('name');
    const storeType = searchParams.get('type');

    if (name) setStoreName(name);

    if (lat && lng) {
      setLoading(true);
      fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: parseFloat(lat), 
          lng: parseFloat(lng),
          storeType 
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInsights(data.insights);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-emerald-900">
              Welcome to RepRally
            </h1>
            <a
              href={process.env.NODE_ENV === 'production' ? 'https://www.reprally.com/' : 'http://localhost:3000'}
              className="px-6 py-2 bg-emerald-600 text-white font-heading font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Success Message */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Success Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6 mx-auto">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-heading font-bold text-gray-900 text-center mb-4">
                You're all set{storeName ? `, ${storeName}` : ''}!
              </h2>
              
              <p className="text-lg text-gray-600 text-center mb-8">
                Welcome to the RepRally community. We've analyzed your local market and put together some insights to help you get started.
              </p>

              {/* Next Steps */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">What happens next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      1
                    </span>
                    <span className="text-gray-700">
                      Our team will review your information and reach out within 24-48 hours
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      2
                    </span>
                    <span className="text-gray-700">
                      We'll schedule a quick call to understand your needs and show you our catalog
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      3
                    </span>
                    <span className="text-gray-700">
                      Start ordering products that your customers will love
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Insights Section - Full Width Grid */}
          <div>
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6 text-center">Your Local Market Snapshot</h3>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Nearby Competition */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-3xl mb-2">📍</div>
                  <h4 className="font-heading font-semibold text-gray-900 mb-2">Nearby Stores</h4>
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {insights.nearby.within_3_miles}
                  </div>
                  <p className="text-sm text-gray-500">within 3 miles</p>
                </div>

                {/* Quality Rating */}
                {insights.quality.avg_rating_local && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-3xl mb-2">⭐</div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Local Avg Rating</h4>
                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                      {insights.quality.avg_rating_local.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {insights.quality.percentile && `${getOrdinalSuffix(insights.quality.percentile)} percentile`}
                    </p>
                  </div>
                )}

                {/* Top Store Type */}
                {insights.composition.local_types.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-3xl mb-2">🏪</div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Most Common</h4>
                    <div className="text-xl font-bold text-emerald-600 mb-1">
                      {formatStoreType(insights.composition.local_types[0].type)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {insights.composition.local_types[0].percentage}% of local stores
                    </p>
                  </div>
                )}

                {/* Trending */}
                {insights.trending.categories.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-3xl mb-2">🔥</div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Trending</h4>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {insights.trending.categories[0]}
                    </div>
                    <p className="text-xs text-gray-500">
                      {insights.trending.confidence} confidence
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No insights available
              </div>
            )}

            {/* Detailed Insights Below */}
            {insights && !loading && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Closest Stores */}
                {insights.nearby.closest.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-heading font-semibold text-gray-900 mb-4">📍 Closest Stores</h4>
                    <div className="space-y-3">
                      {insights.nearby.closest.slice(0, 5).map((store, idx) => (
                        <div key={idx} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                          <div className="font-medium text-gray-900">{store.store_name}</div>
                          <div className="text-gray-500 text-xs">
                            {formatStoreType(store.store_type)} • {store.distance_miles} mi
                            {store.google_place_rating && ` • ⭐ ${store.google_place_rating}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Store Type Breakdown */}
                {insights.composition.local_types.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-heading font-semibold text-gray-900 mb-4">🏪 Local Store Mix</h4>
                    <div className="space-y-3">
                      {insights.composition.local_types.slice(0, 5).map((type, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="text-gray-700">{formatStoreType(type.type)}</span>
                            <span className="text-gray-500">{type.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${type.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Trending Categories */}
                {insights.trending.categories.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-heading font-semibold text-gray-900 mb-4">🔥 Trending Locally</h4>
                    <div className="space-y-2">
                      {insights.trending.categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-emerald-600 font-bold">{idx + 1}.</span>
                          <span className="text-gray-900">{cat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            insights.trending.confidence === 'high'
                              ? 'bg-green-100 text-green-700'
                              : insights.trending.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {insights.trending.confidence} confidence
                        </span>
                        <span>Based on {insights.nearby.within_3_miles} nearby stores</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {insights.composition.underserved.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-heading font-semibold text-amber-900 mb-4">💡 Opportunities</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      These categories are underrepresented in your area:
                    </p>
                    <div className="space-y-2">
                      {insights.composition.underserved.map((type, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          <span className="text-amber-900 font-medium">{formatStoreType(type)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Comparison */}
                {insights.quality.avg_rating_local && insights.quality.avg_rating_statewide && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-heading font-semibold text-gray-900 mb-4">⭐ Quality Benchmark</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Local avg:</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {insights.quality.avg_rating_local.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">NJ avg:</span>
                        <span className="text-lg font-bold text-gray-600">
                          {insights.quality.avg_rating_statewide.toFixed(1)}
                        </span>
                      </div>
                      {insights.quality.percentile !== null && (
                        <div className="mt-4 pt-4 border-t text-center">
                          <div className="text-3xl font-bold text-emerald-600">
                            {getOrdinalSuffix(insights.quality.percentile)}
                          </div>
                          <div className="text-xs text-gray-500">percentile statewide</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

