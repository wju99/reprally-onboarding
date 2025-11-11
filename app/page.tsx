export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          Store Onboarding
        </h1>
        <p className="mt-4 text-slate-600">
          Next.js scaffold is ready. Configure environment variables to connect Supabase,
          Google Maps + Places, and PostHog. We&apos;ll add the two-step flow next.
        </p>
        <div className="mt-8 rounded-lg border p-4">
          <ul className="list-disc pl-5 text-sm text-slate-700">
            <li>Supabase URL and anon key</li>
            <li>Google Maps API key</li>
            <li>PostHog key (optional)</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

