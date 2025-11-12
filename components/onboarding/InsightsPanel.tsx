'use client';

import type { LocalInsights } from '@/lib/insights/queries';

interface InsightsPanelProps {
  insights: LocalInsights | null;
  loading: boolean;
}

export function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm">Enter your address to see local insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-emerald-600 text-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-serif font-bold mb-1">Your Local Market</h3>
        <p className="text-emerald-100 text-sm">Live insights from your area</p>
      </div>

      {/* Nearby Stores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-3">📍 Nearby Competition</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Within 1 mile:</span>
            <span className="font-medium">{insights.nearby.within_1_mile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Within 3 miles:</span>
            <span className="font-medium">{insights.nearby.within_3_miles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Within 5 miles:</span>
            <span className="font-medium">{insights.nearby.within_5_miles}</span>
          </div>
        </div>

        {insights.nearby.closest.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Closest Stores</p>
            <div className="space-y-2">
              {insights.nearby.closest.slice(0, 3).map((store, idx) => (
                <div key={idx} className="text-sm">
                  <div className="font-medium text-gray-900">{store.store_name}</div>
                  <div className="text-gray-500 text-xs">
                    {store.store_type} • {store.distance_miles} mi
                    {store.google_place_rating && ` • ⭐ ${store.google_place_rating}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quality Metrics */}
      {insights.quality.avg_rating_local && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">⭐ Quality Benchmark</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Local avg rating:</span>
              <span className="font-medium">{insights.quality.avg_rating_local.toFixed(1)}</span>
            </div>
            {insights.quality.avg_rating_statewide && (
              <div className="flex justify-between">
                <span className="text-gray-600">NJ avg rating:</span>
                <span className="font-medium">{insights.quality.avg_rating_statewide.toFixed(1)}</span>
              </div>
            )}
            {insights.quality.percentile !== null && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {insights.quality.percentile}th
                  </div>
                  <div className="text-xs text-gray-500">percentile statewide</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trending Categories */}
      {insights.trending.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">🔥 What's Trending Locally</h4>
          <div className="space-y-2">
            {insights.trending.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-emerald-600 font-bold">{idx + 1}.</span>
                <span className="text-gray-900">{cat}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
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

      {/* Composition */}
      {insights.composition.local_types.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-3">🏪 Local Store Mix</h4>
          <div className="space-y-2">
            {insights.composition.local_types.slice(0, 5).map((type, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 capitalize">{type.type}</span>
                  <span className="text-gray-500">{type.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underserved */}
      {insights.composition.underserved.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 text-sm mb-2">💡 Opportunity</h4>
          <p className="text-xs text-amber-800">
            These categories are underrepresented locally:{' '}
            <span className="font-medium">{insights.composition.underserved.join(', ')}</span>
          </p>
        </div>
      )}
    </div>
  );
}

