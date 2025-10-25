"use client";

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Legend,
} from 'recharts';

export type ReviewItem = {
  id: string;
  sentimentLabel?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | null;
  aiConfidence?: number | null;
  analyzedAt?: string | Date | null;
};

const COLORS = ['#22c55e', '#ef4444', '#94a3b8']; // green, red, slate

export default function ReviewAnalytics({ reviews }: { reviews: ReviewItem[] }) {
  const { total, data } = useMemo(() => {
    const counts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 } as Record<string, number>;
    for (const r of reviews) {
      const label = (r.sentimentLabel || 'NEUTRAL') as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
      counts[label] = (counts[label] || 0) + 1;
    }
    const total = reviews.length || 1;
    const data = [
      { name: 'Positive', value: counts.POSITIVE },
      { name: 'Negative', value: counts.NEGATIVE },
      { name: 'Neutral', value: counts.NEUTRAL },
    ];
    return { total, data };
  }, [reviews]);

  const percent = (n: number) => Math.round((n / (total || 1)) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-[#0047ab] mb-4">Sentiment Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Positive: {percent((data[0]?.value) || 0)}%</p>
          <p>Negative: {percent((data[1]?.value) || 0)}%</p>
          <p>Neutral: {percent((data[2]?.value) || 0)}%</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-[#0047ab] mb-4">Sentiment Counts</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
