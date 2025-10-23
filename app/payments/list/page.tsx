"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/sidebar";
import { useRouter } from "next/navigation";

// Helper to decode JWT and get role
function getRoleFromJWT(token: string): "admin" | "user" | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" ? "admin" : "user";
  } catch {
    return null;
  }
}

export default function PaymentsListPage() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) {
      router.replace("/auth/login");
      return;
    }
    const userRole = getRoleFromJWT(jwt);
    if (!userRole) {
      router.replace("/auth/login");
      return;
    }
    setRole(userRole);
  }, [router]);

  if (!role) {
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
      <Sidebar role={role} />
      <main className="flex-1 p-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 text-[#0047ab] font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-[#0047ab] mb-2">Payment History</h1>
          <p className="text-gray-600 mb-6">View all payment transactions</p>
          
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment History</h3>
            <p className="text-gray-600">Payment transaction data will be displayed here</p>
          </div>
        </div>
      </main>
    </div>
  );
}