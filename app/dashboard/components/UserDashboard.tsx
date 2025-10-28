"use client";
import React, { useState, useEffect } from "react";
import BranchManagement from "../../branches/components/BranchManagement";
import UserPaymentsPanel from "./UserPaymentsPanel";
import { usePathname } from "next/navigation";

type TabType = "dashboard" | "branches" | "payments";

export default function UserDashboard() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Update active tab based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    
    if (tab === "payments") {
      setActiveTab("payments");
    } else if (tab === "branches") {
      setActiveTab("branches");
    } else if (tab === "dashboard") {
      setActiveTab("dashboard");
    } else if (pathname.includes("/payments")) {
      setActiveTab("payments");
    } else if (pathname.includes("/branches")) {
      setActiveTab("branches");
    } else {
      setActiveTab("dashboard");
    }
  }, [pathname]);

  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: "📊" },
    { id: "branches" as TabType, label: "Branch Management", icon: "🏢" },
    { id: "payments" as TabType, label: "Payment History", icon: "💳" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <UserDashboardContent />;
      case "branches":
        return <BranchManagement />;
      case "payments":
        return <UserPaymentsPanel />;
      default:
        return <UserDashboardContent />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#0047ab] mb-2">User Dashboard</h1>
        <p className="text-gray-600">Manage your branches and view payment history</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-[#0047ab] shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}

function UserDashboardContent() {
  const [localTop, setLocalTop] = useState<any[] | null>(null);
  const [viewMode, setViewMode] = useState<'interactive' | 'static'>('interactive');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const v = localStorage.getItem('dashboard_view_mode');
      if (v === 'interactive' || v === 'static') setViewMode(v as 'interactive' | 'static');
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dashboard_view_mode', viewMode);
    } catch (e) {
      // ignore
    }
  }, [viewMode]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('top_worst_reviews');
      if (raw) setLocalTop(JSON.parse(raw));
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Company Analysis Report */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-extrabold text-[#0047ab] mb-2">Company Analysis Report</h1>
        <p className="text-lg text-gray-700 mb-4">Comprehensive sentiment analysis and insights for business performance.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-[#f5faff] rounded-lg p-4 text-center">
            <h2 className="text-xl font-bold text-[#0047ab] mb-1">Overall Sentiment</h2>
            {localTop ? (
              (() => {
                const counts: any = { positive: 0, negative: 0, neutral: 0 };
                for (const r of localTop) counts[(r.sentiment || 'neutral')] = (counts[(r.sentiment || 'neutral')] || 0) + 1;
                const total = localTop.length || 1;
                const majority = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                return (
                  <>
                    <p className="text-2xl font-semibold text-green-600">{majority.charAt(0).toUpperCase()+majority.slice(1)}</p>
                    <p className="text-sm text-gray-500">{Math.round((counts[majority]/total)*100*10)/10}% of uploaded feedback</p>
                  </>
                )
              })()
            ) : (
              <>
                <p className="text-2xl font-semibold text-green-600">Positive</p>
                <p className="text-sm text-gray-500">Majority of feedback is positive</p>
              </>
            )}
          </div>
          <div className="bg-[#f5faff] rounded-lg p-4 text-center">
            <h2 className="text-xl font-bold text-[#0047ab] mb-1">Negative Feedback</h2>
            <p className="text-2xl font-semibold text-red-500">9.6%</p>
            <p className="text-sm text-gray-500">Areas for improvement identified</p>
          </div>
          <div className="bg-[#f5faff] rounded-lg p-4 text-center">
            <h2 className="text-xl font-bold text-[#0047ab] mb-1">Neutral Feedback</h2>
            <p className="text-2xl font-semibold text-gray-600">3.4%</p>
            <p className="text-sm text-gray-500">Some feedback is neutral</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard?tab=branches'}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Manage Branches</h3>
              <p className="text-sm text-gray-600">Add, edit, or view branch information</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard?tab=payments'}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Payment History</h3>
              <p className="text-sm text-gray-600">View your payment records and invoices</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed business analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#0047ab] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">🏢</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Branch "Central Branch" was updated</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">💳</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Payment of $79.99 was processed</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">📊</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New analytics report generated</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
