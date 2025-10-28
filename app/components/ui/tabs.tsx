import React from "react";

export function Tabs({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child);
          }
          if (child.type === TabsTrigger) {
            return React.cloneElement(child, {
              ...(typeof child.props === "object" ? child.props : {}),
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex gap-2 ${className}`}>{children}</div>;
}

export function TabsTrigger({
  value,
  children,
  onValueChange,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  onValueChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-lg font-medium border border-[#0047ab] bg-white text-[#0047ab] hover:bg-[#0047ab] hover:text-white transition-colors ${
        className
      }`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );
}