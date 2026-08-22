"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import FeedTab from "./_components/FeedTab";
import ManageNoticesTab from "./_components/ManageNoticesTab";

export default function NoticesPage() {
  const { hasPermission } = useAuth();
  const canView = hasPermission("VIEW_NOTICES");
  const canManage = hasPermission("MANAGE_NOTICES");

  const tabs = [
    canView ? { id: "feed", label: "Feed" } : null,
    canManage ? { id: "manage", label: "Manage" } : null,
  ].filter(Boolean);

  const [tab, setTab] = useState(tabs[0]?.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Notice Board
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Notices</h1>
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

      {tab === "feed" ? <FeedTab /> : null}
      {tab === "manage" ? <ManageNoticesTab /> : null}
      {!tab ? (
        <p className="text-sm text-ink-muted">You don&apos;t have access to notices.</p>
      ) : null}
    </div>
  );
}
