"use client";
import React, { useState } from "react";

type Payment = {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "cancelled" | "failed";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPaymentsPanel() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      userId: "user1",
      userEmail: "john@example.com",
      planId: "1",
      planName: "Basic Plan",
      amount: 29.99,
      status: "completed",
      paymentMethod: "Credit Card",
      transactionId: "txn_123456789",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:35:00Z"
    },
    {
      id: "2",
      userId: "user2",
      userEmail: "jane@example.com",
      planId: "2",
      planName: "Professional Plan",
      amount: 79.99,
      status: "pending",
      paymentMethod: "PayPal",
      transactionId: "txn_987654321",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z"
    },
    {
      id: "3",
      userId: "user3",
      userEmail: "bob@example.com",
      planId: "3",
      planName: "Enterprise Plan",
      amount: 199.99,
      status: "cancelled",
      paymentMethod: "Bank Transfer",
      transactionId: "txn_456789123",
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T11:30:00Z"
    },
    {
      id: "4",
      userId: "user4",
      userEmail: "alice@example.com",
      planId: "1",
      planName: "Basic Plan",
      amount: 29.99,
      status: "failed",
      paymentMethod: "Credit Card",
      transactionId: "txn_789123456",
      createdAt: "2024-01-18T16:45:00Z",
      updatedAt: "2024-01-18T16:50:00Z"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "cancelled" | "failed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === "all" || payment.status === filter;
    const matchesSearch = payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updatePaymentStatus = (paymentId: string, newStatus: Payment["status"]) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: newStatus, updatedAt: new Date().toISOString() }
        : payment
    ));
  };

  const getTotalRevenue = () => {
    return payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getStatusCounts = () => {
    return {
      completed: payments.filter(p => p.status === "completed").length,
      pending: payments.filter(p => p.status === "pending").length,
      cancelled: payments.filter(p => p.status === "cancelled").length,
      failed: payments.filter(p => p.status === "failed").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0047ab]">Payment History</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">${getTotalRevenue().toFixed(2)}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⏳</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">✕</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-600">{statusCounts.failed}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">⚠</span>
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
              placeholder="Search by email, plan, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "completed", "cancelled", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.planName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{payment.transactionId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {payment.status === "pending" && (
                        <>
                          <button
                            onClick={() => updatePaymentStatus(payment.id, "completed")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(payment.id, "cancelled")}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {payment.status === "failed" && (
                        <button
                          onClick={() => updatePaymentStatus(payment.id, "pending")}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payments found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
