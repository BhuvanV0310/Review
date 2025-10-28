"use client";
import React, { useState } from "react";

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
};

export default function AdminPlansPanel() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "1",
      name: "Basic Plan",
      description: "Essential features for small businesses",
      price: 29.99,
      duration: "monthly",
      features: ["Basic analytics", "Email support", "5 branches"],
      isActive: true,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Professional Plan",
      description: "Advanced features for growing businesses",
      price: 79.99,
      duration: "monthly",
      features: ["Advanced analytics", "Priority support", "Unlimited branches", "Custom reports"],
      isActive: true,
      createdAt: "2024-01-15"
    },
    {
      id: "3",
      name: "Enterprise Plan",
      description: "Full-featured solution for large organizations",
      price: 199.99,
      duration: "monthly",
      features: ["All features", "24/7 support", "API access", "Custom integrations"],
      isActive: true,
      createdAt: "2024-01-15"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "monthly",
    features: "",
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlan: Plan = {
      id: editingPlan?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: formData.duration,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      isActive: formData.isActive,
      createdAt: editingPlan?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? newPlan : p));
    } else {
      setPlans([...plans, newPlan]);
    }

    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "monthly",
      features: "",
      isActive: true
    });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration,
      features: plan.features.join(', '),
      isActive: plan.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (planId: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      setPlans(plans.filter(p => p.id !== planId));
    }
  };

  const togglePlanStatus = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0047ab]">Plan Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPlan(null);
            setFormData({
              name: "",
              description: "",
              price: "",
              duration: "monthly",
              features: "",
              isActive: true
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-[#0047ab] mb-1">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">/{plan.duration}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2">Features:</h4>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              <button
                onClick={() => togglePlanStatus(plan.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  plan.isActive 
                    ? 'text-orange-600 hover:bg-orange-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {plan.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-[#0047ab] mb-4">
              {editingPlan ? 'Edit Plan' : 'Add New Plan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Plan</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
