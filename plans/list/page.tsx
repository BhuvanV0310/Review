"use client";
import React, { useState } from "react";
import Sidebar from "../../app/components/layout/sidebar";
import { useRouter } from "next/navigation";

// Example plan data; replace with API data in future
const initialPlans = [
  {
    name: "Basic Plan",
    price: "$49/mo",
    description: "Basic sentiment analysis for up to 1 branch.",
    features: ["Single branch analysis", "Monthly report", "Email support"],
    status: "active",
  },
  {
    name: "Pro Plan",
    price: "$99/mo",
    description: "Advanced analysis for up to 5 branches.",
    features: ["Multi-branch analysis", "Weekly report", "Priority support"],
    status: "active",
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    description: "Custom solutions for large organizations.",
    features: ["Unlimited branches", "Custom reporting", "Dedicated manager"],
    status: "inactive",
  },
];

const ListPlanPage = () => {
  const router = useRouter();
  const [plans] = useState(initialPlans);

  return (
    <div className="flex min-h-screen bg-[#eaf1fb]">
      <Sidebar role="admin" />
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
        <h1 className="text-2xl font-bold text-[#0047ab] mb-6">Subscription Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold text-[#0047ab] mb-2">{plan.name}</h2>
              <div className={`mb-2 px-3 py-1 rounded-full text-xs font-bold ${plan.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </div>
              <div className="text-lg font-semibold mb-2">{plan.price}</div>
              <p className="text-gray-700 mb-4 text-center">{plan.description}</p>
              <ul className="list-disc pl-5 text-gray-600 mb-4 text-left w-full">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx}>{feature}</li>
                ))}
              </ul>
              <button className="px-4 py-2 rounded bg-[#0047ab] text-white font-semibold shadow hover:bg-blue-700">Choose Plan</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ListPlanPage;
