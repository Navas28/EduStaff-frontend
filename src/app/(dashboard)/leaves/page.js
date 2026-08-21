"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MyLeavesTab from "./_components/MyLeavesTab";
import ReviewLeavesTab from "./_components/ReviewLeavesTab";
import MyDutiesTab from "./_components/MyDutiesTab";

export default function LeavesPage() {
  const { hasPermission } = useAuth();
  const canApply = hasPermission("APPLY_LEAVE");
  const canApprove = hasPermission("APPROVE_LEAVES");

  const tabs = [
    canApply ? { id: "mine", label: "My leaves" } : null,
    canApprove ? { id: "review", label: "Review" } : null,
    { id: "duties", label: "My substitute duties" },
  ].filter(Boolean);

  const [tab, setTab] = useState(tabs[0]?.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Leaves
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Leaves</h1>
      </div>

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

      {tab === "mine" ? <MyLeavesTab /> : null}
      {tab === "review" ? <ReviewLeavesTab /> : null}
      {tab === "duties" ? <MyDutiesTab /> : null}
    </div>
  );
}
