"use client";
import React, { useState } from "react";
import Sidebar from "../../app/components/layout/sidebar";
import { useRouter } from "next/navigation";

const AddPlanPage = () => {
  const router = useRouter();
  const [plan, setPlan] = useState({
    name: "",
    price: "",
    description: "",
    features: [""],
    status: "active",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (idx: number, value: string) => {
    const updated = [...plan.features];
    updated[idx] = value;
    setPlan({ ...plan, features: updated });
  };

  const addFeature = () => {
    setPlan({ ...plan, features: [...plan.features, ""] });
  };

  const removeFeature = (idx: number) => {
    setPlan({ ...plan, features: plan.features.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!plan.name || !plan.price || !plan.description || plan.features.some(f => !f)) {
      setError("All fields and features are required.");
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Plan added successfully!");
      setPlan({ name: "", price: "", description: "", features: [""], status: "active" });
    } catch {
      setError("Failed to add plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eaf1fb]">
      <Sidebar role="admin" />
      <main className="flex-1 p-10 flex flex-col items-center justify-center relative">
        <button
          onClick={() => router.back()}
          className="absolute top-0 left-0 mt-2 ml-2 flex items-center gap-2 px-4 py-2 bg-white rounded shadow hover:bg-gray-100 text-[#0047ab] font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="max-w-lg w-full bg-white rounded-lg shadow p-8 mt-8">
          <h2 className="text-xl font-bold text-[#0047ab] mb-4">Add Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Plan Name"
              value={plan.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="price"
              placeholder="Price (e.g. $49/mo or Custom)"
              value={plan.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={plan.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => handleFeatureChange(idx, e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                  {plan.features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(idx)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addFeature} className="px-3 py-1 bg-blue-500 text-white rounded">Add Feature</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={plan.status}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-[#0047ab] text-white font-semibold shadow hover:bg-blue-700">
              {loading ? "Adding..." : "Add Plan"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddPlanPage;
