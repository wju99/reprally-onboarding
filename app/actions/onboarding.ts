'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getLocalInsights } from '@/lib/insights/queries';

export interface OnboardingDraft {
  sessionId: string;
  storeName?: string;
  googlePlaceId?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  storeType?: string;
  hours?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface OnboardingComplete extends OnboardingDraft {
  whatsSelling?: string;
  productsExcitedAbout?: string;
  bestTimeToReach?: string;
  preferredContactMethod?: string;
}

/**
 * Save or update Step 1 draft
 */
export async function saveOnboardingDraft(data: OnboardingDraft) {
  const supabase = createServerClient();

  // Check if draft exists
  const { data: existing } = await supabase
    .from('onboarding_submissions')
    .select('id')
    .eq('session_id', data.sessionId)
    .single();

  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from('onboarding_submissions')
      .update({
        store_name: data.storeName,
        google_place_id: data.googlePlaceId,
        formatted_address: data.formattedAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        store_type: data.storeType,
        hours: data.hours,
        owner_email: data.ownerEmail,
        owner_phone: data.ownerPhone,
        step_completed: 1,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: updated.id };
  } else {
    // Create new
    const { data: created, error } = await supabase
      .from('onboarding_submissions')
      .insert({
        session_id: data.sessionId,
        store_name: data.storeName,
        google_place_id: data.googlePlaceId,
        formatted_address: data.formattedAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        store_type: data.storeType,
        hours: data.hours,
        owner_email: data.ownerEmail,
        owner_phone: data.ownerPhone,
        step_completed: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: created.id };
  }
}

/**
 * Complete onboarding (Step 2)
 */
export async function completeOnboarding(data: OnboardingComplete) {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from('onboarding_submissions')
    .select('id')
    .eq('session_id', data.sessionId)
    .single();

  if (!existing) {
    throw new Error('No draft found for this session');
  }

  const { data: updated, error } = await supabase
    .from('onboarding_submissions')
    .update({
      whats_selling: data.whatsSelling,
      products_excited_about: data.productsExcitedAbout,
      best_time_to_reach: data.bestTimeToReach,
      preferred_contact_method: data.preferredContactMethod,
      step_completed: 2,
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return { success: true, id: updated.id };
}

/**
 * Get insights for a location
 */
export async function fetchInsights(lat: number, lon: number, storeType?: string) {
  try {
    const insights = await getLocalInsights(lat, lon, storeType);
    return { success: true, insights };
  } catch (error) {
    console.error('Error fetching insights:', error);
    return { success: false, error: 'Failed to fetch insights' };
  }
}

