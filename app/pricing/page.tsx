"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  status: string;
  stripePriceId?: string;
}

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams?.get('canceled');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    
    // Show cancelled message if redirected from cancelled checkout
    if (canceled === 'true') {
      setError('Payment was cancelled. You can try again whenever you\'re ready.');
    }
  }, [canceled]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setProcessingPlanId(planId);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eaf1fb] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf1fb] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0047ab] mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your business needs. All plans include our powerful sentiment analysis tools.
          </p>
        </div>

        {/* Error/Cancelled Message */}
        {error && (
          <div className={`mb-8 max-w-4xl mx-auto ${
            canceled === 'true' 
              ? 'bg-orange-50 border border-orange-200 text-orange-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          } px-4 py-3 rounded-lg`}>
            <p>{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans
            .filter(plan => plan.status === 'ACTIVE')
            .map((plan, index) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  index === 1 ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {index === 1 && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-[#0047ab] mb-2">
                    {plan.name}
                  </h3>
                  
                  {/* Plan Description */}
                  <p className="text-gray-600 mb-6 h-12">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-[#0047ab]">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  
                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPlanId === plan.id || !plan.stripePriceId}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      index === 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {processingPlanId === plan.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : !plan.stripePriceId ? (
                      'Coming Soon'
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                  
                  {/* Features */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg
                            className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
