"use client";
import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import ChartComponent from "./components/Chart";
import Sidebar from "../components/layout/sidebar";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { useRouter } from "next/navigation";

function getRoleFromJWT(token: string): "admin" | "user" | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" ? "admin" : "user";
  } catch {
    return null;
  }
}

const DashboardPage = () => {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [localTop, setLocalTop] = useState<any[] | null>(null);
  // Persist view mode in localStorage so user's preference survives reloads
  const [viewMode, setViewMode] = useState<'interactive' | 'static'>('interactive');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const v = localStorage.getItem('dashboard_view_mode');
      if (v === 'interactive' || v === 'static') setViewMode(v as 'interactive' | 'static');
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dashboard_view_mode', viewMode);
    } catch (e) {
      // ignore
    }
  }, [viewMode]);

  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) {
      router.replace("/auth/login");
      return;
    }
    const userRole = getRoleFromJWT(jwt);
    if (!userRole) {
      router.replace("/auth/login");
      return;
    }
    setRole(userRole);
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('top_worst_reviews');
      if (raw) setLocalTop(JSON.parse(raw));
    } catch (err) {
      // ignore
    }
  }, []);

  if (!role) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen bg-[#eaf1fb]">
      <Sidebar role={role} />
      <main className="flex-1 p-10">
        {role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <UserDashboard />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;