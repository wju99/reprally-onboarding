import { createServerClient } from '@/lib/supabase/server';
import { haversineDistance, getBoundingBox } from '@/lib/geo/haversine';

export interface NearbyStore {
  id: string;
  store_name: string;
  store_type: string;
  google_place_rating: number | null;
  google_place_rating_count: number | null;
  distance_miles: number;
}

export interface LocalInsights {
  nearby: {
    within_1_mile: number;
    within_3_miles: number;
    within_5_miles: number;
    closest: NearbyStore[];
  };
  quality: {
    avg_rating_local: number | null;
    avg_rating_statewide: number | null;
    sample_size_local: number;
    percentile: number | null;
  };
  composition: {
    local_types: { type: string; count: number; percentage: number }[];
    state_types: { type: string; count: number; percentage: number }[];
    underserved: string[];
  };
  trending: {
    categories: string[];
    confidence: 'high' | 'medium' | 'low';
  };
}

/**
 * Get comprehensive local insights for a given location
 */
export async function getLocalInsights(
  lat: number,
  lon: number,
  storeType?: string
): Promise<LocalInsights> {
  const supabase = createServerClient();

  // Get bounding box for 5 mile radius (covers all our queries)
  const bbox = getBoundingBox(lat, lon, 5);

  // Fetch all stores within bounding box (uppercase column names)
  const { data: stores, error } = await supabase
    .from('nj_stores')
    .select('*')
    .gte('STORE_LATITUDE', bbox.minLat)
    .lte('STORE_LATITUDE', bbox.maxLat)
    .gte('STORE_LONGITUDE', bbox.minLon)
    .lte('STORE_LONGITUDE', bbox.maxLon)
    .not('STORE_LATITUDE', 'is', null)
    .not('STORE_LONGITUDE', 'is', null);

  if (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }

  // Calculate distances and filter
  const storesWithDistance = (stores || [])
    .map((store) => ({
      ...store,
      distance_miles: haversineDistance(
        lat,
        lon,
        store.STORE_LATITUDE!,
        store.STORE_LONGITUDE!
      ),
    }))
    .filter((s) => s.distance_miles <= 5)
    .sort((a, b) => a.distance_miles - b.distance_miles);

  // Nearby counts
  const within1 = storesWithDistance.filter((s) => s.distance_miles <= 1);
  const within3 = storesWithDistance.filter((s) => s.distance_miles <= 3);
  const within5 = storesWithDistance;

  const closest: NearbyStore[] = storesWithDistance.slice(0, 5).map((s) => ({
    id: s.id,
    store_name: s.STORE_NAME || 'Unknown',
    store_type: s.STORE_TYPE || 'other',
    google_place_rating: s.GOOGLE_PLACE_RATING,
    google_place_rating_count: s.GOOGLE_PLACE_RATING_COUNT,
    distance_miles: Math.round(s.distance_miles * 10) / 10,
  }));

  // Quality metrics
  const localRatings = within3
    .filter((s) => s.GOOGLE_PLACE_RATING != null)
    .map((s) => s.GOOGLE_PLACE_RATING!);

  const avgRatingLocal =
    localRatings.length > 0
      ? localRatings.reduce((a, b) => a + b, 0) / localRatings.length
      : null;

  // Get statewide average
  const { data: statewideData } = await supabase
    .from('nj_stores')
    .select('GOOGLE_PLACE_RATING')
    .not('GOOGLE_PLACE_RATING', 'is', null);

  const statewideRatings = (statewideData || []).map(
    (s) => s.GOOGLE_PLACE_RATING!
  );
  const avgRatingStatewide =
    statewideRatings.length > 0
      ? statewideRatings.reduce((a, b) => a + b, 0) / statewideRatings.length
      : null;

  // Calculate percentile
  let percentile: number | null = null;
  if (avgRatingLocal && statewideRatings.length > 0) {
    const below = statewideRatings.filter((r) => r < avgRatingLocal).length;
    percentile = Math.round((below / statewideRatings.length) * 100);
  }

  // Composition analysis
  const localTypeCounts = new Map<string, number>();
  within3.forEach((s) => {
    const type = s.STORE_TYPE || 'other';
    localTypeCounts.set(type, (localTypeCounts.get(type) || 0) + 1);
  });

  const { data: allStores } = await supabase
    .from('nj_stores')
    .select('STORE_TYPE');

  const stateTypeCounts = new Map<string, number>();
  (allStores || []).forEach((s) => {
    const type = s.STORE_TYPE || 'other';
    stateTypeCounts.set(type, (stateTypeCounts.get(type) || 0) + 1);
  });

  const localTotal = within3.length;
  const stateTotal = allStores?.length || 1;

  const localTypes = Array.from(localTypeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / localTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const stateTypes = Array.from(stateTypeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / stateTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Find underserved categories (state has >5% but local has <3%)
  const underserved: string[] = [];
  stateTypes.forEach(({ type, percentage: statePerc }) => {
    const localPerc = localTypes.find((l) => l.type === type)?.percentage || 0;
    if (statePerc > 5 && localPerc < 3) {
      underserved.push(type);
    }
  });

  // Trending categories (fictional mapping from store types)
  const trending = getTrendingCategories(within3, storeType);

  return {
    nearby: {
      within_1_mile: within1.length,
      within_3_miles: within3.length,
      within_5_miles: within5.length,
      closest,
    },
    quality: {
      avg_rating_local: avgRatingLocal
        ? Math.round(avgRatingLocal * 10) / 10
        : null,
      avg_rating_statewide: avgRatingStatewide
        ? Math.round(avgRatingStatewide * 10) / 10
        : null,
      sample_size_local: localRatings.length,
      percentile,
    },
    composition: {
      local_types: localTypes,
      state_types: stateTypes.slice(0, 10),
      underserved: underserved.slice(0, 3),
    },
    trending,
  };
}

/**
 * Generate fictional trending categories based on local store types
 */
function getTrendingCategories(
  stores: any[],
  userStoreType?: string
): { categories: string[]; confidence: 'high' | 'medium' | 'low' } {
  // Map store types to product categories
  const categoryMap: Record<string, string[]> = {
    convenience: ['Snacks & Beverages', 'Ready-to-eat meals', 'Energy drinks'],
    grocery: ['Fresh produce', 'Organic products', 'International foods'],
    foodservice: ['Sandwiches & wraps', 'Coffee & pastries', 'Local specialties'],
    liquor: ['Craft beer', 'Premium spirits', 'Wine selections'],
    gas: ['Convenience items', 'Car care', 'Quick snacks'],
    other: ['Everyday essentials', 'Local favorites', 'Seasonal items'],
  };

  const typeCounts = new Map<string, number>();
  stores.forEach((s) => {
    const type = s.STORE_TYPE || 'other';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });

  // Get top 3 types
  const topTypes = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  // Generate categories
  const categories: string[] = [];
  topTypes.forEach((type) => {
    const cats = categoryMap[type] || categoryMap.other;
    categories.push(...cats.slice(0, 1));
  });

  // Confidence based on sample size
  const confidence: 'high' | 'medium' | 'low' =
    stores.length > 20 ? 'high' : stores.length > 10 ? 'medium' : 'low';

  return {
    categories: categories.slice(0, 3),
    confidence,
  };
}

