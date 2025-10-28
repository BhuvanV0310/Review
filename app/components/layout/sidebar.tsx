import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Role = "admin" | "user";

interface SidebarProps {
  role: Role;
}

type DropdownItem = {
  label: string;
  href: string;
  roles?: Role[];
  icon?: React.ReactNode;
};

type MenuItem = {
  label: string;
  href?: string;
  roles: Role[];
  dropdown?: DropdownItem[];
  icon?: React.ReactNode;
};

// Modern icon components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
  </svg>
);

const BranchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PlanIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PaymentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const AddIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PendingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CancelledIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const menu: MenuItem[] = [
  // Panel / Dashboard
  {
    label: "Panel",
    href: "/dashboard",
    roles: ["admin", "user"],
    icon: <DashboardIcon />,
  },

  // Branch management (for users only)
  {
    label: "Branch Management",
    href: "/branches",
    roles: ["user"],
    icon: <BranchIcon />,
  },

  // Plan management (dropdown)
  {
    label: "Plan Management",
    roles: ["admin", "user"],
    icon: <PlanIcon />,
    dropdown: [
      { label: "List Plans", href: "/plans/list", roles: ["admin", "user"], icon: <ListIcon /> },
      { label: "Manage Plans", href: "/plans", roles: ["admin"], icon: <EditIcon /> },
    ],
  },

  // Payment history (dropdown). Filtering by customer is handled on the payments pages.
  {
    label: "Payment History",
    roles: ["admin", "user"],
    icon: <PaymentIcon />,
    dropdown: [
      { label: "List Payments", href: "/payments/list", icon: <ListIcon /> },
      { label: "Pending", href: "/payments/pending", icon: <PendingIcon /> },
      { label: "Cancelled", href: "/payments/cancelled", icon: <CancelledIcon /> },
    ],
  },
];

function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <aside className="w-72 h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Bhuvan Admin
            </h1>
            <p className="text-xs text-blue-200/70 capitalize">{role} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 relative z-10 overflow-y-auto">
        {menu.map((item) => {
          if (!item.roles.includes(role)) return null;

          // Simple link
          if (!item.dropdown && item.href) {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30"
                    : "hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
                }`}
              >
                <span className={`mr-3 transition-colors duration-300 ${active ? "text-blue-100" : "text-gray-300 group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          }

          // Dropdown
          const isOpen = openDropdown === item.label;
          const activeDropdown = item.dropdown
            ? item.dropdown.some(
                (sub) =>
                  pathname === sub.href &&
                  (!sub.roles || sub.roles.includes(role))
              )
            : false;

          return (
            <div key={item.label} className="relative">
              <button
                onClick={() => handleDropdown(item.label)}
                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  activeDropdown
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30"
                    : "hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
                }`}
              >
                <div className="flex items-center">
                  <span className={`mr-3 transition-colors duration-300 ${activeDropdown ? "text-blue-100" : "text-gray-300 group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {activeDropdown && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${
                      isOpen ? "rotate-180 text-blue-200" : "text-gray-400 group-hover:text-white"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-out ${
                  isOpen 
                    ? "max-h-96 opacity-100 transform translate-y-0" 
                    : "max-h-0 opacity-0 transform -translate-y-2"
                }`}
              >
                <div className="mt-2 ml-6 mr-2 space-y-1 relative">
                  {/* Connecting line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/50 to-transparent"></div>
                  
                  {item.dropdown &&
                    item.dropdown
                      .filter(
                        (sub) =>
                          !sub.roles || sub.roles.includes(role)
                      )
                      .map((sub, index) => {
                        const active = pathname === sub.href;
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className={`group flex items-center px-4 py-2.5 ml-4 rounded-lg text-sm transition-all duration-300 transform hover:scale-[1.02] hover:translate-x-1 relative ${
                              active
                                ? "bg-gradient-to-r from-blue-500/90 to-blue-400/90 text-white font-semibold shadow-lg shadow-blue-500/20 border border-blue-300/30"
                                : "hover:bg-white/10 hover:shadow-md hover:shadow-white/5 text-gray-300 hover:text-white backdrop-blur-sm border border-transparent hover:border-white/10"
                            }`}
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: isOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                            }}
                          >
                            {/* Connector dot */}
                            <div className={`absolute -left-6 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                              active ? "bg-blue-400 shadow-lg shadow-blue-400/50" : "bg-gray-500 group-hover:bg-white"
                            }`}></div>
                            
                            <span className={`mr-3 transition-colors duration-300 ${active ? "text-blue-100" : "text-gray-400 group-hover:text-white"}`}>
                              {sub.icon}
                            </span>
                            <span className="font-medium">{sub.label}</span>
                            
                            {active && (
                              <div className="ml-auto">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                              </div>
                            )}
                          </Link>
                        );
                      })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">
              {role === "admin" ? "A" : "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {role === "admin" ? "Administrator" : "User"}
            </p>
            <p className="text-xs text-gray-400">Active Session</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => {
              try {
                // clear auth and cached data
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('jwt');
                  localStorage.removeItem('top_worst_reviews');
                  localStorage.removeItem('chart_data');
                  localStorage.removeItem('company_data_url');
                  localStorage.removeItem('dashboard_view_mode');
                }
              } catch (e) {}
              router.replace('/auth/login');
            }}
            className="text-sm font-medium text-red-400 hover:text-white bg-transparent px-3 py-2 rounded-lg border border-transparent hover:bg-red-600/10 transition"
          >
            Logout
          </button>
          <a href="/auth/login" className="text-xs text-gray-300/60">Switch Account</a>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .group:hover .group-hover\\:animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;