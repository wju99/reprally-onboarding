import "./globals.css";
import type { Metadata } from "next";
import { PostHogClientProvider } from "../components/providers/PostHogClientProvider";

export const metadata: Metadata = {
  title: "Store Onboarding",
  description: "Onboarding flow with instant local insights"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogClientProvider>
          {props.children}
        </PostHogClientProvider>
      </body>
    </html>
  );
}

