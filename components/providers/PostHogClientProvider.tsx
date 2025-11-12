"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

// Initialize PostHog outside of the component to ensure it's ready immediately
if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  if (key && !posthog.__loaded) {
    posthog.init(key, {
      api_host: "/ingest",
      ui_host: host || "https://us.i.posthog.com",
      defaults: "2025-05-24",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
      loaded: (ph) => {
        console.log('PostHog initialized successfully!');
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog config:', ph.config);
        }
      },
    });
  }
}

export function PostHogClientProvider({ children }: Props) {
  useEffect(() => {
    // Verify PostHog is loaded
    if (posthog.__loaded) {
      console.log('PostHog is ready in provider');
    } else {
      console.warn('PostHog not loaded yet');
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
