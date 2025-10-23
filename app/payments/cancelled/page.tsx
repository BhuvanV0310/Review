"use client";
import React, { useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import { useRouter } from "next/navigation";

// Example payment data; replace with API data in future
const initialPayments = [
  {
    id: "PAY003",
    client: "Gamma Inc",
    plan: "Enterprise Plan",
    amount: "Custom",
    date: "2025-08-15",
    status: "Cancelled",
  },
  {
    id: "PAY006",
    client: "Omega Pvt",
    plan: "Basic Plan",
    amount: "$49",
    date: "2025-09-02",
    status: "Cancelled",
  },
];

const CancelledPaymentPage = () => {
  const router = useRouter();
  const [payments] = useState(initialPayments);

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
        <h1 className="text-2xl font-bold text-[#0047ab] mb-6">Cancelled Payments</h1>
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          <table className="min-w-full border border-gray-200 text-center">
            <thead>
              <tr className="bg-red-500 text-white">
                <th className="py-3 px-6 font-semibold">Payment ID</th>
                <th className="py-3 px-6 font-semibold">Client</th>
                <th className="py-3 px-6 font-semibold">Plan</th>
                <th className="py-3 px-6 font-semibold">Amount</th>
                <th className="py-3 px-6 font-semibold">Date</th>
                <th className="py-3 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr key={idx} className="border-b hover:bg-red-50 transition-all">
                  <td className="py-3 px-6 align-middle">{payment.id}</td>
                  <td className="py-3 px-6 align-middle">{payment.client}</td>
                  <td className="py-3 px-6 align-middle">{payment.plan}</td>
                  <td className="py-3 px-6 align-middle">{payment.amount}</td>
                  <td className="py-3 px-6 align-middle">{payment.date}</td>
                  <td className="py-3 px-6 align-middle">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CancelledPaymentPage;
