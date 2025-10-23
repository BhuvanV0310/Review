"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/layout/sidebar";

// Helper to decode JWT and get role
function getRoleFromJWT(token: string): "admin" | "user" | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" ? "admin" : "user";
  } catch {
    return null;
  }
}

export default function PlansPage() {
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-[#0047ab] mb-2">Plans Management</h1>
          <p className="text-gray-600 mb-6">Manage subscription plans and pricing</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => router.push("/plans/list")}
              className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0047ab]">View Plans</h3>
                  <p className="text-gray-600">Browse all available subscription plans</p>
                </div>
              </div>
            </button>

            {role === 'admin' && (
              <>
                <button
                  onClick={() => router.push("/plans/add")}
                  className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0047ab]">Add New Plan</h3>
                      <p className="text-gray-600">Create a new subscription plan</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push("/plans/edit")}
                  className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0047ab]">Edit Plan</h3>
                      <p className="text-gray-600">Modify existing subscription plans</p>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}