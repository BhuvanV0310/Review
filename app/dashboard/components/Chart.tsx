"use client";
import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ChartComponent() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer per-company chart URL if present
        const companyUrlsRaw = typeof window !== 'undefined' ? localStorage.getItem('company_data_url') : null;
        let chartUrl = '/chart_data.json';
        if (companyUrlsRaw) {
          try {
            const companyUrls = JSON.parse(companyUrlsRaw);
            if (companyUrls && companyUrls.chart) chartUrl = companyUrls.chart;
          } catch (err) {
            // fall back
          }
        }
        const res = await fetch(chartUrl, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (mounted) setData(json);
          return;
        }
      } catch (e) {
        // ignore
      }
      // fallback to localStorage-stored chart_data
      try {
        const raw = localStorage.getItem('chart_data');
        if (raw) {
          const json = JSON.parse(raw);
          if (mounted) setData(json);
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!data) return <div className="text-gray-600">No chart data available.</div>;

  const sentimentCounts = data.sentiment_counts || {};
  const pieData = {
    labels: Object.keys(sentimentCounts),
    datasets: [{ data: Object.values(sentimentCounts), backgroundColor: ['#16a34a', '#ef4444', '#71717a'] }]
  };

  const byCategory = data.by_category || {};
  const categories = new Set<string>();
  const sentiments = Object.keys(byCategory || {});
  for (const s of sentiments) {
    const obj = byCategory[s] || {};
    Object.keys(obj).forEach(k => categories.add(k));
  }
  const catList = Array.from(categories).slice(0, 10); // limit to 10 categories for readability

  const barDatasets = sentiments.map((s: string, idx: number) => ({
    label: s,
    data: catList.map((c: string) => (byCategory[s] && byCategory[s][c]) || 0),
    backgroundColor: [`rgba(${50 + idx * 40}, 99, 132, 0.6)`],
  }));

  const barData = {
    labels: catList,
    datasets: barDatasets,
  };

  const barOptions: any = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { stacked: true }, y: { stacked: true } }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0047ab] mb-2">Sentiment Distribution</h3>
        <div className="w-full max-w-sm mx-auto">
          <Pie data={pieData} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#0047ab] mb-2">Sentiment by Category (top 10)</h3>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}
