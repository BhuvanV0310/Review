"use client";
import React, { useState } from "react";
import BranchTable from "../components/BranchTable";
import Sidebar from "../../components/layout/sidebar";
import { useRouter } from "next/navigation";

const ListBranchPage = () => {
  const router = useRouter();
  const [branches, setBranches] = useState<{
    name: string;
    location: string;
    reviewLink: string;
    contactNo: string;
    status: "active" | "inactive";
  }[]>([
    {
      name: "Main Branch",
      location: "New York",
      reviewLink: "https://example.com/review/1",
      contactNo: "1234567890",
      status: "active",
    },
    {
      name: "West Branch",
      location: "Los Angeles",
      reviewLink: "https://example.com/review/2",
      contactNo: "9876543210",
      status: "inactive",
    },
  ]);

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
        <h1 className="text-2xl font-bold text-[#0047ab] mb-6">Branch List</h1>
        <BranchTable branches={branches} />
      </main>
    </div>
  );
};

export default ListBranchPage;
