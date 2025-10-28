"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

type User = {
  email: string;
  name?: string;
  role?: string;
  branches?: any[];
};

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      const res = await fetch('/api/auth/list-users', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setError(null);
      } else {
        const text = await res.text();
        // If forbidden, show a helpful message
        if (res.status === 403) {
          setError('You must be logged in as an admin to view customers.');
        } else {
          setError('Failed to fetch users: ' + text);
        }
        console.error('Failed to fetch users', text);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggle = (email: string) => {
    setSelected((s) => ({ ...s, [email]: !s[email] }));
  };

  const createUser = async () => {
    if (!createForm.email || !createForm.password) {
      setError("Email and password are required");
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ contactEmail: createForm.email, password: createForm.password, role: 'user' }),
      });
      
      if (res.ok) {
        setShowCreateForm(false);
        setCreateForm({ email: "", password: "" });
        setError(null);
        fetchUsers();
      } else {
        const errorText = await res.text();
        setError('Create user failed: ' + errorText);
      }
    } catch (e) {
      setError('Error creating user');
    }
  };
  const deleteSelected = async () => {
    const emails = Object.keys(selected).filter((k) => selected[k]);
    if (!emails.length) return;
    if (!confirm(`Delete ${emails.length} selected user(s)? This cannot be undone.`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      const res = await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ emails }),
      });
      if (res.ok) {
        // refresh
        setSelected({});
        fetchUsers();
      } else {
        alert('Failed to delete users: ' + (await res.text()));
      }
    } catch (e) {
      alert('Error deleting users');
    }
  };

  const router = useRouter();

  const tryDemoAdmin = async () => {
    try {
      // Attempt a convenience demo-admin login (only works if that account/password exists in data/users.json)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-admin@example.com', password: 'TestAdmin123!' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('jwt', data.token);
          setError(null);
          fetchUsers();
          return;
        }
      }
      alert('Demo admin login failed — please log in manually.');
    } catch (e) {
      console.error('demo login failed', e);
      alert('Demo admin login failed — please log in manually.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#0047ab]">Customers</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateForm(true)} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create New User</button>
          <button onClick={deleteSelected} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Selected</button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center justify-between">
            <div className="text-sm text-yellow-800">{error}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/auth/login')} className="px-3 py-1 bg-white border rounded">Log in</button>
              <button onClick={tryDemoAdmin} className="px-3 py-1 bg-blue-600 text-white rounded">Try Demo Admin</button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No customers found.</p>
          ) : (
            users.map((u) => (
              <div key={u.email} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{u.name || u.email}</div>
                  <div className="text-xs text-gray-500">{u.branches ? `${u.branches.length} branches` : '0 branches'}</div>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={!!selected[u.email]} onChange={() => toggle(u.email)} className="mr-2" />
                    <span className="text-sm">Select</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-[#0047ab] mb-4">Create New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter temporary password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({ email: "", password: "" });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
