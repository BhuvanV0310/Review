import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ children, className = "", variant = "default", ...props }: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0047ab]";
  const variants = {
    default: "bg-[#0047ab] text-white hover:bg-blue-700",
    outline: "bg-white border border-[#0047ab] text-[#0047ab] hover:bg-blue-50",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}