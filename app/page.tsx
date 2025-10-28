"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./components/layout/sidebar";
import { useRouter } from "next/navigation";

// Helper to decode JWT and get role (assumes { role: "admin" | "user" } in payload)
function getRoleFromJWT(token: string): "admin" | "user" | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" ? "admin" : "user";
  } catch {
    return null;
  }
}

const Page = () => {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user" | null>(null);

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

  if (!role) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <Sidebar role={role} />
    </div>
  );
};

export default Page;