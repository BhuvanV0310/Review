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

const EditPlanPage = () => {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [selected, setSelected] = useState<number[]>([]);

  // Handle select/deselect plan
  const handleSelect = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Handle delete selected plans
  const handleDeleteSelected = () => {
    setPlans((prev) => prev.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
  };

  // Handle delete single plan
  const handleDelete = (idx: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== idx));
    setSelected((prev) => prev.filter((i) => i !== idx));
  };

  // Handle edit plan (simple inline editing)
  const handleEdit = (idx: number, field: string, value: string) => {
    setPlans((prev) =>
      prev.map((plan, i) =>
        i === idx ? { ...plan, [field]: value } : plan
      )
    );
  };

  // Handle edit features
  const handleFeatureEdit = (pidx: number, fidx: number, value: string) => {
    setPlans((prev) =>
      prev.map((plan, i) =>
        i === pidx
          ? { ...plan, features: plan.features.map((f, fi) => (fi === fidx ? value : f)) }
          : plan
      )
    );
  };

  const addFeature = (pidx: number) => {
    setPlans((prev) =>
      prev.map((plan, i) =>
        i === pidx ? { ...plan, features: [...plan.features, ""] } : plan
      )
    );
  };

  const removeFeature = (pidx: number, fidx: number) => {
    setPlans((prev) =>
      prev.map((plan, i) =>
        i === pidx ? { ...plan, features: plan.features.filter((_, fi) => fi !== fidx) } : plan
      )
    );
  };

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
        <h1 className="text-2xl font-bold text-[#0047ab] mb-6">Edit Plans</h1>
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
          <table className="min-w-full border border-gray-200 text-center">
            <thead>
              <tr className="bg-[#0047ab] text-white">
                <th className="py-3 px-6 font-semibold"></th>
                <th className="py-3 px-6 font-semibold">Name</th>
                <th className="py-3 px-6 font-semibold">Price</th>
                <th className="py-3 px-6 font-semibold">Description</th>
                <th className="py-3 px-6 font-semibold">Features</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => (
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
                      value={plan.name}
                      onChange={(e) => handleEdit(idx, "name", e.target.value)}
                      className="border rounded px-2 py-1 w-32 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="text"
                      value={plan.price}
                      onChange={(e) => handleEdit(idx, "price", e.target.value)}
                      className="border rounded px-2 py-1 w-24 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <input
                      type="text"
                      value={plan.description}
                      onChange={(e) => handleEdit(idx, "description", e.target.value)}
                      className="border rounded px-2 py-1 w-40 text-center"
                    />
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <div className="flex flex-col gap-2">
                      {plan.features.map((feature, fidx) => (
                        <div key={fidx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={feature}
                            onChange={e => handleFeatureEdit(idx, fidx, e.target.value)}
                            className="border rounded px-2 py-1 w-32 text-center"
                          />
                          {plan.features.length > 1 && (
                            <button type="button" onClick={() => removeFeature(idx, fidx)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addFeature(idx)} className="px-3 py-1 bg-blue-500 text-white rounded">Add Feature</button>
                    </div>
                  </td>
                  <td className="py-3 px-6 align-middle">
                    <select
                      value={plan.status}
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

export default EditPlanPage;
