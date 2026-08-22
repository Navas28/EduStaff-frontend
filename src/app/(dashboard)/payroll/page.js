"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MyPayslipsTab from "./_components/MyPayslipsTab";
import ManagePayrollTab from "./_components/ManagePayrollTab";

export default function PayrollPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_PAYROLL");
  const canViewOwn = hasPermission("VIEW_OWN_PAYSLIP");

  const tabs = [
    canViewOwn ? { id: "mine", label: "My payslips" } : null,
    canManage ? { id: "manage", label: "Manage payroll" } : null,
  ].filter(Boolean);

  const [tab, setTab] = useState(tabs[0]?.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Payroll
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Payroll</h1>
      </div>

      {tabs.length > 1 ? (
        <div className="flex gap-2">
          {tabs.map((item) => (
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

      {tab === "mine" ? <MyPayslipsTab /> : null}
      {tab === "manage" ? <ManagePayrollTab /> : null}
      {!tab ? <p className="text-sm text-ink-muted">You don&apos;t have access to payroll.</p> : null}
    </div>
  );
}
