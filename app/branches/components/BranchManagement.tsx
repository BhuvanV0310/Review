"use client";
import React, { useState } from "react";

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  manager: string;
  status: "active" | "inactive";
  createdAt: string;
};

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "1",
      name: "Central Branch",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "(555) 123-4567",
      email: "central@company.com",
      manager: "John Smith",
      status: "active",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "North Branch",
      address: "456 Oak Avenue",
      city: "Boston",
      state: "MA",
      zipCode: "02101",
      phone: "(555) 234-5678",
      email: "north@company.com",
      manager: "Jane Doe",
      status: "active",
      createdAt: "2024-01-20"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    manager: "",
    status: "active" as "active" | "inactive"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBranch: Branch = {
      id: editingBranch?.id || Date.now().toString(),
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      phone: formData.phone,
      email: formData.email,
      manager: formData.manager,
      status: formData.status,
      createdAt: editingBranch?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (editingBranch) {
      setBranches(branches.map(b => b.id === editingBranch.id ? newBranch : b));
    } else {
      setBranches([...branches, newBranch]);
    }

    setShowForm(false);
    setEditingBranch(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      manager: "",
      status: "active"
    });
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status
    });
    setShowForm(true);
  };

  const handleDelete = (branchId: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      setBranches(branches.filter(b => b.id !== branchId));
    }
  };

  const toggleBranchStatus = (branchId: string) => {
    setBranches(branches.map(b => 
      b.id === branchId ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0047ab]">Branch Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBranch(null);
            setFormData({
              name: "",
              address: "",
              city: "",
              state: "",
              zipCode: "",
              phone: "",
              email: "",
              manager: "",
              status: "active"
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Branch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-[#0047ab]">{branches.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">🏢</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Branches</p>
              <p className="text-2xl font-bold text-green-600">{branches.filter(b => b.status === "active").length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Branches</p>
              <p className="text-2xl font-bold text-red-600">{branches.filter(b => b.status === "inactive").length}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⏸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{branch.name}</h3>
                <p className="text-gray-600 text-sm">{branch.city}, {branch.state}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                branch.status === "active" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="text-gray-600">Address:</span>
                <p className="font-medium">{branch.address}</p>
                <p className="font-medium">{branch.city}, {branch.state} {branch.zipCode}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{branch.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{branch.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Manager:</span>
                <span className="font-medium">{branch.manager}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{branch.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(branch)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              <button
                onClick={() => toggleBranchStatus(branch.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  branch.status === "active" 
                    ? 'text-orange-600 hover:bg-orange-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {branch.status === "active" ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Branch Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#0047ab] mb-4">
              {editingBranch ? 'Edit Branch' : 'Add New Branch'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status === "active"}
                  onChange={(e) => setFormData({...formData, status: e.target.checked ? "active" : "inactive"})}
                  className="mr-2"
                />
                <label htmlFor="status" className="text-sm font-medium text-gray-700">Active Branch</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
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
