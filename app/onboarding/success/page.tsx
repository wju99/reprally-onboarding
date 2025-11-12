'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InsightsPanel } from '@/components/onboarding/InsightsPanel';
import type { LocalInsights } from '@/lib/insights/queries';
import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';

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

// Placeholder trending products
const placeholderProducts = [
  {
    name: 'Prime Hydration Drink',
    description: 'Viral sports hydration drink by Logan Paul and KSI. Extremely high demand, especially among younger customers. Multiple flavor options available.',
    localInterest: 87,
    growthTrend: 24,
    nearbyStores: 12
  },
  {
    name: 'Ghost Energy Drink (Warheads)',
    description: 'Collaboration energy drink featuring Warheads candy flavoring. Popular with Gen Z customers. Zero sugar, 200mg caffeine per can.',
    localInterest: 79,
    growthTrend: 19,
    nearbyStores: 10
  },
  {
    name: 'Elf Bar BC5000 Disposable Vape',
    description: 'Top-selling disposable vape device with 5000 puffs. Multiple flavor options. Consistent repeat purchase item for vape customers.',
    localInterest: 73,
    growthTrend: 15,
    nearbyStores: 8
  },
  {
    name: 'Takis Fuego Rolled Tortilla Chips',
    description: 'Hot chili pepper & lime flavored rolled tortilla chips. Strong impulse buy at checkout. Popular with younger demographics.',
    localInterest: 68,
    growthTrend: 12,
    nearbyStores: 7
  },
  {
    name: 'Celsius Energy Drink Variety Pack',
    description: 'Fitness-focused energy drink with metabolism-boosting claims. Appeals to health-conscious consumers. 12-pack variety format drives higher transaction value.',
    localInterest: 61,
    growthTrend: 10,
    nearbyStores: 5
  }
];

function SuccessPageContent() {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const [insights, setInsights] = useState<LocalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const name = searchParams.get('name');
    const storeType = searchParams.get('type');

    if (name) setStoreName(name);

    // Track success page view
    if (!hasTrackedView) {
      posthog?.capture('onboarding_success_page_viewed', {
        store_name: name,
        store_type: storeType,
        has_location: !!(lat && lng),
      });
      setHasTrackedView(true);
    }

    if (lat && lng) {
      setLoading(true);
      setError(null);
      
      fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: parseFloat(lat), 
          lng: parseFloat(lng),
          storeType 
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch insights');
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setInsights(data.insights);
            
            // Track insights loaded
            posthog?.capture('onboarding_insights_loaded', {
              store_name: name,
              nearby_stores: data.insights.nearby.within_5_miles,
              has_quality_data: !!data.insights.quality.avg_rating_local,
            });
          } else {
            throw new Error(data.error || 'Failed to load insights');
          }
        })
        .catch((err) => {
          console.error('Insights error:', err);
          setError(err.message || 'Unable to load market insights. Please try refreshing the page.');
          
          // Track insights load failure
          posthog?.capture('onboarding_insights_load_failed', {
            store_name: name,
            error: err.message,
          });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams, posthog, hasTrackedView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-heading font-bold text-emerald-900">
            Welcome to RepRally
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Success Message */}
          <div className="animate-fade-in">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Success Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6 mx-auto animate-scale-in">
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

              <h2 className="text-3xl font-heading font-bold text-gray-900 text-center mb-4 animate-slide-up animate-delay-100">
                You're all set{storeName ? `, ${storeName}` : ''}!
              </h2>
              
              <p className="text-lg text-gray-600 text-center mb-8 animate-slide-up animate-delay-200">
                Welcome to the RepRally community. We've analyzed your local market and put together some insights to help you get started.
              </p>

              {/* Next Steps */}
              <div className="border-t pt-6 animate-slide-up animate-delay-200">
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
          <div className="animate-slide-up animate-delay-300">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6 text-center">Your Local Market Snapshot</h3>
            
            {error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-heading font-semibold text-red-900 mb-2">
                  Unable to Load Insights
                </h4>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white font-heading font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
                  <div className="text-3xl mb-2">📍</div>
                  <h4 className="font-heading font-semibold text-gray-900 mb-2">Nearby Stores</h4>
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {insights.nearby.within_3_miles}
                  </div>
                  <p className="text-sm text-gray-500">within 3 miles</p>
                </div>

                {/* Quality Rating */}
                {insights.quality.avg_rating_local && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
                    <div className="text-3xl mb-2">⭐</div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Local Avg Rating</h4>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {insights.quality.avg_rating_local.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {insights.quality.percentile && `${getOrdinalSuffix(insights.quality.percentile)} percentile`}
                    </p>
                  </div>
                )}

                {/* Top Store Type */}
                {insights.composition.local_types.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
                    <div className="text-3xl mb-2">🏪</div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Most Common</h4>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {formatStoreType(insights.composition.local_types[0].type)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {insights.composition.local_types[0].percentage}% of local stores
                    </p>
                  </div>
                )}

                {/* Trending */}
                {insights.trending.categories.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
                    <div className="text-3xl mb-2">🔥</div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Trending</h4>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {insights.trending.categories[0]}
                    </div>
                    <p className="text-sm text-gray-500">
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
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

                {/* Quality Comparison - Moved to 3rd position */}
                {insights.quality.avg_rating_local && insights.quality.avg_rating_statewide && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:bg-emerald-50/30 cursor-pointer">
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

            {/* Trending Products Section */}
            {insights && !loading && (
              <div className="mt-12 animate-slide-up animate-delay-400">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">🔥 Trending Products in Your Area</h3>
                    <p className="text-gray-600">Based on activity from {insights.nearby.within_3_miles} nearby stores</p>
                  </div>

                  {/* Scrollable Products Grid */}
                  <div className="max-h-[800px] overflow-y-auto px-2 py-2 space-y-4">
                    {placeholderProducts.map((product, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] mx-1">
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-32 h-32 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                            {idx === 0 ? (
                              <img 
                                src="https://i5.walmartimages.com/seo/Prime-Hydration-Drink-Ice-Pop-16-9-fl-oz-Single-Bottle_d72f3f5e-ee10-4e0e-a622-3ecfbabb98e0.bf2ca72d6ab03e7bfb1f36553a6b6545.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF" 
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center"><div class="text-center"><div class="text-4xl mb-2">🥤</div><div class="text-xs text-blue-900 font-medium">Prime Hydration</div></div></div>';
                                  }
                                }}
                              />
                            ) : idx === 1 ? (
                              <img 
                                src="https://drinkghost.com/cdn/shop/files/WarheadsSGAFront_700x.webp?v=1744834489" 
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-purple-200 to-purple-400 flex items-center justify-center"><div class="text-center"><div class="text-4xl mb-2">⚡</div><div class="text-xs text-purple-900 font-medium">Ghost Energy</div></div></div>';
                                  }
                                }}
                              />
                            ) : idx === 2 ? (
                              <img 
                                src="https://vapeshire.com/uploads/images/1009/1680266028_elf-bar-disposable-bc5000-sour-candy-5000-puffs.png" 
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center"><div class="text-center"><div class="text-4xl mb-2">💨</div><div class="text-xs text-pink-900 font-medium">Elf Bar</div></div></div>';
                                  }
                                }}
                              />
                            ) : idx === 3 ? (
                              <img 
                                src="https://i5.walmartimages.com/seo/Takis-Fuego-9-9-oz-Sharing-Size-Bag-Hot-Chili-Pepper-Lime-Rolled-Tortilla-Chips_76742e16-af39-4831-a1b4-94093b9f371b.faaa746f028bb5c9d6562d3ad74afd56.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF" 
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-red-200 to-red-400 flex items-center justify-center"><div class="text-center"><div class="text-4xl mb-2">🌶️</div><div class="text-xs text-red-900 font-medium">Takis Fuego</div></div></div>';
                                  }
                                }}
                              />
                            ) : idx === 4 ? (
                              <img 
                                src="https://i5.walmartimages.com/seo/CELSIUS-Sparkling-Original-Variety-Pack-Functional-Essential-Energy-Drink-12-fl-oz-Pack-of-12_a29d7021-4f98-4d41-bf0f-a032e6e0c522.044a477b8ce4639a7baae71fae0579e0.jpeg" 
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center"><div class="text-center"><div class="text-4xl mb-2">💪</div><div class="text-xs text-orange-900 font-medium">Celsius Energy</div></div></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-4xl mb-2">📦</div>
                                  <div className="text-xs text-emerald-800 font-medium">Product Image</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full">
                                    {idx + 1}
                                  </span>
                                  <h4 className="text-xl font-heading font-bold text-gray-900">{product.name}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {product.description}
                                </p>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Local Interest</div>
                                <div className="text-lg font-bold text-emerald-600">
                                  {product.localInterest}%
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Growth Trend</div>
                                <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                                  <span>↑</span>
                                  <span>{product.growthTrend}%</span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Nearby Stores</div>
                                <div className="text-lg font-bold text-gray-700">
                                  {product.nearbyStores}
                                </div>
                              </div>
                            </div>

                            {/* Action Hint */}
                            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="font-medium">Consider stocking this category to meet local demand</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Note */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      💡 These insights are based on aggregated data from stores in your area. Connect with local reps to learn more about specific products and opportunities.
                    </p>
                  </div>
                </div>
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

