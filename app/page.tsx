import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
              Small businesses,
              <br />
              <span className="italic">big impact</span>
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of independent stores across New Jersey. See what's working locally and get the support you need to thrive.
            </p>
            <Link
              href="/onboarding"
              className="inline-block px-8 py-4 bg-white text-emerald-900 font-semibold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Join RepRally
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Know Your Market</h3>
              <p className="text-gray-600">
                See what's happening around you—nearby stores, local trends, and opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Connected</h3>
              <p className="text-gray-600">
                Access brands and products that your customers love, delivered with care.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Grow Together</h3>
              <p className="text-gray-600">
                Join a community of store owners who support each other's success.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
