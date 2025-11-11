"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export function PostHogClientProvider(props: Props) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true
    });
  }, []);

  return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
}

