"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/layout/sidebar';
import ReviewAnalytics from './components/ReviewAnalytics';

type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

type Review = {
  id: string;
  userId: string;
  text: string;
  rating?: number | null;
  sentimentScore?: number | null;
  sentimentLabel?: SentimentLabel | null;
  feedbackCategory?: 'PRODUCT' | 'SERVICE' | 'DELIVERY' | 'OTHER' | null;
  aiConfidence?: number | null;
  analyzedAt?: string | null;
  createdAt: string;
};

export default function ReviewsPage() {
  const [sessionRole, setSessionRole] = useState<'ADMIN' | 'CUSTOMER' | 'DELIVERY_PARTNER' | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ text: '', rating: 5, feedbackCategory: '' });

  // Fetch session to determine role
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        const role = data?.user?.role ?? null;
        setSessionRole(role);
      } catch {
        setSessionRole(null);
      }
    };
    load();
  }, []);

  // Load reviews
  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: form.text,
          rating: form.rating,
          feedbackCategory: form.feedbackCategory || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setForm({ text: '', rating: 5, feedbackCategory: '' });
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const analyticsReviews = useMemo(
    () => reviews.map(r => ({
      id: r.id,
      sentimentLabel: r.sentimentLabel ?? null,
      aiConfidence: r.aiConfidence ?? null,
      analyzedAt: r.analyzedAt ?? null,
    })),
    [reviews]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaf1fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#eaf1fb]">
      <Sidebar role={(sessionRole ? sessionRole.toLowerCase() : 'user') as any} />
      <main className="flex-1 p-10 space-y-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-3xl font-bold text-[#0047ab] mb-2">Reviews</h1>
          <p className="text-gray-600">Submit your feedback and view sentiment analysis in real-time.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-[#0047ab] mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
              <textarea
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring focus:border-blue-300"
                rows={4}
                required
                minLength={3}
                value={form.text}
                onChange={(e) => setForm(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Tell us about your experience..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.rating}
                  onChange={(e) => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.feedbackCategory}
                  onChange={(e) => setForm(prev => ({ ...prev, feedbackCategory: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option value="PRODUCT">Product</option>
                  <option value="SERVICE">Service</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Analytics (Admin only) */}
        {sessionRole === 'ADMIN' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-[#0047ab] mb-4">Analytics</h2>
            <ReviewAnalytics reviews={analyticsReviews} />
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-[#0047ab] mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                  <div>
                    {r.sentimentLabel && (
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        r.sentimentLabel === 'POSITIVE' ? 'bg-green-100 text-green-700' : r.sentimentLabel === 'NEGATIVE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.sentimentLabel}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-800 whitespace-pre-wrap">{r.text}</p>
                <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-4">
                  {r.rating ? <span>Rating: {r.rating}/5</span> : null}
                  {typeof r.sentimentScore === 'number' ? <span>Score: {r.sentimentScore.toFixed(2)}</span> : null}
                  {typeof r.aiConfidence === 'number' ? <span>Confidence: {(r.aiConfidence * 100).toFixed(0)}%</span> : null}
                  {r.analyzedAt ? <span>Analyzed: {new Date(r.analyzedAt).toLocaleString()}</span> : null}
                  {r.feedbackCategory ? <span>Category: {r.feedbackCategory}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
