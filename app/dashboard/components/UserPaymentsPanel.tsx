"use client";
import React, { useState } from "react";

type Payment = {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  status: "pending" | "completed" | "cancelled" | "failed";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  dueDate?: string;
};

export default function UserPaymentsPanel() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      planId: "1",
      planName: "Professional Plan",
      amount: 79.99,
      status: "completed",
      paymentMethod: "Credit Card",
      transactionId: "txn_123456789",
      createdAt: "2024-01-15T10:30:00Z",
      dueDate: "2024-02-15T10:30:00Z"
    },
    {
      id: "2",
      planId: "1",
      planName: "Professional Plan",
      amount: 79.99,
      status: "pending",
      paymentMethod: "PayPal",
      transactionId: "txn_987654321",
      createdAt: "2024-01-16T14:20:00Z",
      dueDate: "2024-02-16T14:20:00Z"
    },
    {
      id: "3",
      planId: "1",
      planName: "Professional Plan",
      amount: 79.99,
      status: "cancelled",
      paymentMethod: "Bank Transfer",
      transactionId: "txn_456789123",
      createdAt: "2024-01-17T09:15:00Z",
      dueDate: "2024-02-17T09:15:00Z"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "cancelled" | "failed">("all");

  const filteredPayments = payments.filter(payment => 
    filter === "all" || payment.status === filter
  );

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

  const getTotalPaid = () => {
    return payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0047ab]">Payment History</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">${getTotalPaid().toFixed(2)}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === "completed").length}
              </p>
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
              <p className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === "pending").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⏳</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600">${getPendingAmount().toFixed(2)}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
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

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{payment.planName}</h3>
                <p className="text-gray-600 text-sm">Transaction ID: {payment.transactionId}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
                <div className="text-2xl font-bold text-[#0047ab]">${payment.amount.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Payment Method:</span>
                <p className="font-medium">{payment.paymentMethod}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Created:</span>
                <p className="font-medium">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              {payment.dueDate && (
                <div>
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <p className="font-medium">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {payment.status === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <p className="text-yellow-800 text-sm font-medium">
                    This payment is pending. Please complete the payment process or contact support if you have any issues.
                  </p>
                </div>
              </div>
            )}

            {payment.status === "failed" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <p className="text-red-800 text-sm font-medium">
                    This payment failed. Please try again or contact support for assistance.
                  </p>
                </div>
              </div>
            )}

            {payment.status === "cancelled" && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🚫</span>
                  <p className="text-gray-800 text-sm font-medium">
                    This payment was cancelled. Contact support if you need to reactivate your plan.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                  View Details
                </button>
                {payment.status === "failed" && (
                  <button className="px-3 py-1 text-green-600 hover:bg-green-50 rounded text-sm font-medium">
                    Retry Payment
                  </button>
                )}
                {payment.status === "completed" && (
                  <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded text-sm font-medium">
                    Download Receipt
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date(payment.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">💳</span>
          </div>
          <p className="text-lg font-medium">No payments found</p>
          <p className="text-sm">No payments match your current filter criteria.</p>
        </div>
      )}
    </div>
  );
}
