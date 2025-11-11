import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This client is safe to use on the client for public data access.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type NjStore = {
  id: string;
  dma: string | null;
  google_place_id: string | null;
  store_name: string | null;
  google_maps_url: string | null;
  store_latitude: number | null;
  store_longitude: number | null;
  state_id: string | null;
  store_type: string | null;
  area_demographic: string | null;
  google_place_rating: number | null;
  google_place_rating_count: number | null;
  last_activity_date: string | null;
};

