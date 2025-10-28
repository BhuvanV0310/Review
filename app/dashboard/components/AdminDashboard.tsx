"use client";
import React, { useState, useEffect } from "react";
import AdminUsersPanel from "./AdminUsersPanel";
import AdminPlansPanel from "./AdminPlansPanel";
import AdminPaymentsPanel from "./AdminPaymentsPanel";
import AdminProfilePanel from "./AdminProfilePanel";
import { usePathname } from "next/navigation";

type TabType = "users" | "plans" | "payments" | "profile";

export default function AdminDashboard() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>("users");

  // Update active tab based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    
    if (tab === "plans") {
      setActiveTab("plans");
    } else if (tab === "payments") {
      setActiveTab("payments");
    } else if (tab === "profile") {
      setActiveTab("profile");
    } else if (tab === "users") {
      setActiveTab("users");
    } else if (pathname.includes("/plans")) {
      setActiveTab("plans");
    } else if (pathname.includes("/payments")) {
      setActiveTab("payments");
    } else if (pathname.includes("/profile")) {
      setActiveTab("profile");
    } else {
      setActiveTab("users");
    }
  }, [pathname]);

  const tabs = [
    { id: "users" as TabType, label: "User Management", icon: "👥" },
    { id: "plans" as TabType, label: "Plan Management", icon: "📋" },
    { id: "payments" as TabType, label: "Payment History", icon: "💳" },
    { id: "profile" as TabType, label: "Profile List", icon: "👤" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <AdminUsersPanel />;
      case "plans":
        return <AdminPlansPanel />;
      case "payments":
        return <AdminPaymentsPanel />;
      case "profile":
        return <AdminProfilePanel />;
      default:
        return <AdminUsersPanel />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#0047ab] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, plans, payments, and system profiles</p>
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
