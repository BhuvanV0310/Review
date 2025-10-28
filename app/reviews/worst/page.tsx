"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import { useRouter } from "next/navigation";
import { fetchTopWorstReviews } from "../../lib/api";

const TopWorstReviewsPage = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      // prefer company-specific URL if available
      let url = '/top_worst_reviews.json';
      try {
        const raw = localStorage.getItem('company_data_url');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.top) url = parsed.top;
        }
      } catch (err) {
        // ignore
      }
      const data = await fetchTopWorstReviews(url);
      if (mounted) setReviews(data || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#eaf1fb]">
      <Sidebar role="user" />
      <main className="flex-1 p-10">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 text-[#0047ab] font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-[#0047ab] mb-6">Top 20 Worst Reviews</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews available.</p>
          ) : (
            <table className="min-w-full border border-gray-200 text-left">
              <thead>
                <tr className="bg-red-500 text-white">
                  <th className="py-3 px-6 font-semibold">Branch</th>
                  <th className="py-3 px-6 font-semibold">Rating</th>
                  <th className="py-3 px-6 font-semibold">Review</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, idx) => (
                  <tr key={idx} className="border-b hover:bg-red-50 transition-all">
                    <td className="py-3 px-6 align-middle font-semibold text-[#0047ab]">{review.branch || '—'}</td>
                    <td className="py-3 px-6 align-middle">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{review.rating ?? '—'}</span>
                    </td>
                    <td className="py-3 px-6 align-middle text-gray-700">{review.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default TopWorstReviewsPage;
