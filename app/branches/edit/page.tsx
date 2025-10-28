"use client";
import React, { useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import { useRouter } from "next/navigation";
import BranchTable from "../components/BranchTable";

// Example branch data; replace with API data in future
const initialBranches = [
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
];

const EditBranchPage = () => {
  const router = useRouter();
  const [branches, setBranches] = useState(initialBranches);
  const [selected, setSelected] = useState<number[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Handle save branches
  const handleSave = async () => {
    setSaveStatus("");
    try {
      // Call the service to save branches (implement in services/branches.ts)
      // Example: await saveBranches(branches);
      setSaveStatus("Saved successfully!");
    } catch (err) {
      setSaveStatus("Failed to save changes.");
    }
  };

  // Handle select/deselect branch
  const handleSelect = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Handle delete selected branches
  const handleDeleteSelected = () => {
    setBranches((prev) => prev.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
  };

  // Handle delete single branch
  const handleDelete = (idx: number) => {
    setBranches((prev) => prev.filter((_, i) => i !== idx));
    setSelected((prev) => prev.filter((i) => i !== idx));
  };

  // Handle edit branch (simple inline editing)
  const handleEdit = (idx: number, field: string, value: string) => {
    setBranches((prev) =>
      prev.map((branch, i) =>
        i === idx ? { ...branch, [field]: value } : branch
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-[#eaf1fb]">
      <Sidebar role="admin" />
      <main className="flex-1 p-10">
        <div className="mb-4 flex justify-end gap-4">
          <button
            onClick={handleDeleteSelected}
            disabled={selected.length === 0}
            className={`px-4 py-2 rounded bg-red-500 text-white font-semibold shadow ${selected.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
          >
            Delete Selected
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700"
          >
            Save
          </button>
        </div>
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 text-[#0047ab] font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-[#0047ab] mb-6">Edit Branches</h1>
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleDeleteSelected}
            disabled={selected.length === 0}
            className={`px-4 py-2 rounded bg-red-500 text-white font-semibold shadow ${selected.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
          >
            Delete Selected
          </button>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
        {saveStatus && (
          <div className={`mb-2 text-center font-semibold ${saveStatus.includes("success") ? "text-green-600" : "text-red-500"}`}>{saveStatus}</div>
        )}
          <table className="min-w-full border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#0047ab] text-white">
                <th className="py-3 px-6 font-semibold"></th>
                <th className="py-3 px-6 font-semibold">Name</th>
                <th className="py-3 px-6 font-semibold">Location</th>
                <th className="py-3 px-6 font-semibold">Review Link</th>
                <th className="py-3 px-6 font-semibold">Contact No</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch, idx) => (
                <tr key={idx} className="border-b hover:bg-blue-50 transition-all">
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.includes(idx)}
                      onChange={() => handleSelect(idx)}
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => handleEdit(idx, "name", e.target.value)}
                      className="border rounded px-2 py-1 w-32 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="text"
                      value={branch.location}
                      onChange={(e) => handleEdit(idx, "location", e.target.value)}
                      className="border rounded px-2 py-1 w-32 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="text"
                      value={branch.reviewLink}
                      onChange={(e) => handleEdit(idx, "reviewLink", e.target.value)}
                      className="border rounded px-2 py-1 w-40 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="text"
                      value={branch.contactNo}
                      onChange={(e) => handleEdit(idx, "contactNo", e.target.value)}
                      className="border rounded px-2 py-1 w-32 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <select
                      value={branch.status}
                      onChange={(e) => handleEdit(idx, "status", e.target.value)}
                      className="border rounded px-2 py-1 w-24 text-center"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <button
                      onClick={() => handleDelete(idx)}
                      className="px-3 py-1 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-600"
                    >
                      Delete
                    </button>
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

export default EditBranchPage;
