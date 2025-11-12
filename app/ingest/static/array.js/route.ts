import { NextResponse } from 'next/server';

export async function GET() {
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  
  try {
    const response = await fetch(`${posthogHost}/static/array.js`);
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  } catch (error) {
    console.error('PostHog array.js proxy error:', error);
    return new NextResponse('Error loading PostHog script', { status: 500 });
  }
}

