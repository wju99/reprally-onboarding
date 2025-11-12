import { NextRequest, NextResponse } from 'next/server';
import { getLocalInsights } from '@/lib/insights/queries';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, storeType } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Missing lat/lng' },
        { status: 400 }
      );
    }

    const insights = await getLocalInsights(lat, lng, storeType);

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

