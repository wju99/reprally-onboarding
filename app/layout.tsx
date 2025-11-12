import "./globals.css";
import type { Metadata } from "next";
import { PostHogClientProvider } from "../components/providers/PostHogClientProvider";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Store Onboarding",
  description: "Onboarding flow with instant local insights"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Didact+Gothic&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PostHogClientProvider>
          {props.children}
        </PostHogClientProvider>
      </body>
    </html>
  );
}