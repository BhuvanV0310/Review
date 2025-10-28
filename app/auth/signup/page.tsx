"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { registerUser } from "../services/auth";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    adminKey: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate admin key
    if (form.adminKey !== "Admin123") {
      setError("Invalid admin key. Only administrators can create accounts.");
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser({
        contactEmail: form.email,
        password: form.password,
        role: "admin"
      });
      
      if (res.success) {
        localStorage.setItem("jwt", res.token ?? "");
        router.push("/dashboard");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch {
      setError("Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <rect width="64" height="64" fill="transparent"/>
              <circle cx="32" cy="32" r="1" fill="rgb(59 130 246 / 0.1)" className="animate-pulse"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full bg-gradient-to-r from-blue-200/30 to-indigo-200/30 blur-xl animate-float"></div>
        <div className="absolute top-2/3 right-1/6 w-24 h-24 rounded-full bg-gradient-to-r from-indigo-200/20 to-blue-200/20 blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-2/3 w-16 h-16 rotate-45 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 blur-lg animate-spin-slow"></div>
      </div>

      {/* Main Signup Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/20 animate-slide-up">
        <CardHeader className="text-center space-y-4 pb-8 pt-8">
          {/* Logo/Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:scale-105 animate-bounce-subtle">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800 animate-fade-in">
              Admin Registration
            </h1>
            <p className="text-slate-600 text-sm font-medium animate-fade-in-delayed">
              Create administrator account
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="relative group">
              <Input
                name="email"
                type="email"
                placeholder="Enter admin email"
                value={form.email}
                onChange={handleChange}
                required
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 group-hover:border-blue-300 group-hover:bg-blue-50/50"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 group-hover:border-blue-300 group-hover:bg-blue-50/50"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative group">
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 group-hover:border-blue-300 group-hover:bg-blue-50/50"
              />
            </div>

            {/* Admin Key Input */}
            <div className="relative group">
              <Input
                name="adminKey"
                type="password"
                placeholder="Enter admin key"
                value={form.adminKey}
                onChange={handleChange}
                required
                className="h-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 group-hover:border-blue-300 group-hover:bg-blue-50/50"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="animate-pulse">Creating Account...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Admin Account
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </span>
              )}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium text-center animate-shake">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}
          </form>

          {/* Demo Admin Credentials */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500 font-medium">
                Quick Test
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="h-12 bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-medium"
              onClick={() => {
                setForm({ 
                  email: "demo-admin@example.com", 
                  password: "demo123", 
                  confirmPassword: "demo123",
                  adminKey: "Admin123"
                });
                setError(null);
              }}
            >
              <span className="text-lg">⚡</span>
              <span className="text-sm">Fill Demo Admin</span>
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4">
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(-10px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
          60% { transform: translateY(-1px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out 0.5s; }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out 0.2s both; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .shadow-3xl { box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25); }
      `}</style>
    </div>
  );
}