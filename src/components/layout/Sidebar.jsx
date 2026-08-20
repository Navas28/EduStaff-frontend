"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Overview", href: "/", isVisible: () => true },
  { label: "Staff", href: "/staff", isVisible: (auth) => auth.hasPermission("MANAGE_STAFF") },
  { label: "Timetable", href: "/timetable", isVisible: (auth) => auth.hasPermission("VIEW_TIMETABLE") },
  {
    label: "Attendance",
    href: "/attendance",
    isVisible: (auth) => auth.hasAnyPermission("MARK_ATTENDANCE", "MANAGE_ATTENDANCE"),
  },
  {
    label: "Leaves",
    href: "/leaves",
    isVisible: (auth) => auth.hasAnyPermission("APPLY_LEAVE", "APPROVE_LEAVES"),
  },
  {
    label: "Payroll",
    href: "/payroll",
    isVisible: (auth) => auth.hasAnyPermission("MANAGE_PAYROLL", "VIEW_OWN_PAYSLIP"),
  },
  { label: "Notices", href: "/notices", isVisible: (auth) => auth.hasPermission("VIEW_NOTICES") },
  { label: "Roles", href: "/roles", isVisible: (auth) => Boolean(auth.user?.isSuperAdmin) },
];

export default function Sidebar() {
  const pathname = usePathname();
  const auth = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-ink text-white">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold tracking-tight">EduStaff</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.filter((item) => item.isVisible(auth)).map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-150 ease-out ${
                isActive
                  ? "bg-chalkboard-tint text-ink"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
