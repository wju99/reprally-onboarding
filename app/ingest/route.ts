import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Use the actual PostHog host from your config
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    
    console.log('PostHog Proxy: Forwarding to', posthogHost);
    console.log('PostHog Proxy: Body length', body.length);
    
    const response = await fetch(`${posthogHost}/batch/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    console.log('PostHog Proxy: Response status', response.status);
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('PostHog proxy error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error forwarding to PostHog',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function GET() {
  return new NextResponse('PostHog proxy is running', { status: 200 });
}

