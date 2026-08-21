"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import CheckInTab from "./_components/CheckInTab";
import DailyReportTab from "./_components/DailyReportTab";

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const canMark = hasPermission("MARK_ATTENDANCE");
  const canManage = hasPermission("MANAGE_ATTENDANCE");

  const availableTabs = [
    canMark ? { id: "mine", label: "My attendance" } : null,
    canManage ? { id: "report", label: "Daily report" } : null,
  ].filter(Boolean);

  const [tab, setTab] = useState(availableTabs[0]?.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Attendance
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Attendance</h1>
      </div>

      {availableTabs.length > 1 ? (
        <div className="flex gap-2">
          {availableTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ease-out ${
                tab === item.id
                  ? "bg-ink text-white"
                  : "border border-border-surface bg-surface text-ink-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "mine" ? <CheckInTab /> : null}
      {tab === "report" ? <DailyReportTab /> : null}
      {!tab ? (
        <p className="text-sm text-ink-muted">
          You don&apos;t have access to any attendance views.
        </p>
      ) : null}
    </div>
  );
}
