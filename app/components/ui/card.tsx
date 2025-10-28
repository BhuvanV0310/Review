import React from "react";

export function Card({ children, className = "", style }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-xl shadow-md border ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b bg-white rounded-t-xl ${className}`}>{children}</div>
  );
}

export function CardContent({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-6 ${className}`}>{children}</div>
  );
}