"use client";
import React, { useState } from "react";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
  branches?: string[];
  plan?: string;
};

export default function AdminProfilePanel() {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      status: "active",
      lastLogin: "2024-01-18T10:30:00Z",
      createdAt: "2024-01-15T09:00:00Z",
      branches: ["Central Branch", "North Branch"],
      plan: "Professional Plan"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "active",
      lastLogin: "2024-01-17T14:20:00Z",
      createdAt: "2024-01-10T11:30:00Z",
      branches: ["East Branch"],
      plan: "Basic Plan"
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "user",
      status: "inactive",
      lastLogin: "2024-01-05T16:45:00Z",
      createdAt: "2024-01-01T08:15:00Z",
      branches: ["West Branch", "South Branch"],
      plan: "Enterprise Plan"
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      role: "user",
      status: "suspended",
      lastLogin: "2024-01-12T12:00:00Z",
      createdAt: "2023-12-20T13:45:00Z",
      branches: ["Downtown Branch"],
      plan: "Professional Plan"
    },
    {
      id: "5",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-18T15:30:00Z",
      createdAt: "2023-12-01T10:00:00Z",
      plan: "Admin Access"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showMockDashboard, setShowMockDashboard] = useState(false);

  const filteredProfiles = profiles.filter(profile => {
    const matchesStatus = filter === "all" || profile.status === filter;
    const matchesRole = roleFilter === "all" || profile.role === roleFilter;
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesRole && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateProfileStatus = (profileId: string, newStatus: Profile["status"]) => {
    setProfiles(profiles.map(profile => 
      profile.id === profileId 
        ? { ...profile, status: newStatus }
        : profile
    ));
  };

  const getStats = () => {
    return {
      total: profiles.length,
      active: profiles.filter(p => p.status === "active").length,
      inactive: profiles.filter(p => p.status === "inactive").length,
      suspended: profiles.filter(p => p.status === "suspended").length,
      admins: profiles.filter(p => p.role === "admin").length,
      users: profiles.filter(p => p.role === "user").length,
    };
  };

  const stats = getStats();

  const openMockDashboard = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowMockDashboard(true);
  };

  const MockUserDashboard = () => {
    if (!selectedProfile) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedProfile.name}'s Dashboard</h2>
                <p className="text-blue-100">{selectedProfile.email}</p>
              </div>
              <button
                onClick={() => setShowMockDashboard(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Branches</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedProfile.branches?.length || 0}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🏢</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-lg font-bold text-green-600">{selectedProfile.plan}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📋</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-bold text-purple-600 capitalize">{selectedProfile.status}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">✓</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="text-sm font-bold text-gray-600">
                      {new Date(selectedProfile.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">👤</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Branches Section */}
            {selectedProfile.branches && selectedProfile.branches.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Branches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProfile.branches.map((branch, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600">🏢</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{branch}</h4>
                          <p className="text-sm text-gray-600">Active Branch</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Logged in successfully</p>
                    <p className="text-xs text-gray-500">{new Date(selectedProfile.lastLogin).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🏢</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Branch management updated</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">📊</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Dashboard accessed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{selectedProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <p className="text-gray-800 capitalize">{selectedProfile.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-800">{new Date(selectedProfile.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProfile.status)}`}>
                    {selectedProfile.status.charAt(0).toUpperCase() + selectedProfile.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0047ab]">Profile List</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Profiles</div>
          <div className="text-2xl font-bold text-[#0047ab]">{stats.total}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⏸</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">⚠</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">👑</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👤</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{profile.name}</h3>
                <p className="text-gray-600 text-sm">{profile.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(profile.status)}`}>
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(profile.role)}`}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{profile.plan || "No Plan"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Branches:</span>
                <span className="font-medium">{profile.branches?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Login:</span>
                <span className="font-medium">
                  {new Date(profile.lastLogin).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {profile.branches && profile.branches.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Branches:</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.branches.map((branch, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {branch}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button 
                  onClick={() => openMockDashboard(profile)}
                  className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                >
                  View Dashboard
                </button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded text-sm font-medium">
                  Edit Profile
                </button>
              </div>
              <div className="flex gap-1">
                {profile.status === "active" && (
                  <>
                    <button
                      onClick={() => updateProfileStatus(profile.id, "inactive")}
                      className="px-2 py-1 text-yellow-600 hover:bg-yellow-50 rounded text-xs"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => updateProfileStatus(profile.id, "suspended")}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                    >
                      Block
                    </button>
                  </>
                )}
                {profile.status === "inactive" && (
                  <button
                    onClick={() => updateProfileStatus(profile.id, "active")}
                    className="px-2 py-1 text-green-600 hover:bg-green-50 rounded text-xs"
                  >
                    Activate
                  </button>
                )}
                {profile.status === "suspended" && (
                  <button
                    onClick={() => updateProfileStatus(profile.id, "active")}
                    className="px-2 py-1 text-green-600 hover:bg-green-50 rounded text-xs"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No profiles found matching your criteria.
        </div>
      )}

      {/* Mock Dashboard Modal */}
      {showMockDashboard && <MockUserDashboard />}
    </div>
  );
}