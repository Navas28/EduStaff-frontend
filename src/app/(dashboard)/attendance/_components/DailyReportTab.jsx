"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { todayDateString } from "@/lib/date";
import Card from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import StatusBadge from "@/components/ui/StatusBadge";
import OverrideModal from "./OverrideModal";

export default function DailyReportTab() {
  const [date, setDate] = useState(todayDateString());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overrideTarget, setOverrideTarget] = useState(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch(`/attendance?date=${date}`);
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the report when the date changes
    loadReport();
  }, [loadReport]);

  return (
    <div className="space-y-4">
      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard"
      />

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-surface">
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Name
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Check-in time
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-surface">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-6">
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-ink-muted">
                  No active staff found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.user._id}>
                  <td className="px-6 py-3 text-ink">{row.user.name}</td>
                  <td className="px-6 py-3">
                    {row.status === "NOT_MARKED" ? (
                      <span className="text-xs text-ink-muted">Not marked yet</span>
                    ) : (
                      <StatusBadge status={row.status} />
                    )}
                  </td>
                  <td className="px-6 py-3 text-ink-muted">
                    {row.record?.checkInTime
                      ? new Date(row.record.checkInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => setOverrideTarget(row)}
                      className="text-sm font-semibold text-ink hover:underline"
                    >
                      Override
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {overrideTarget ? (
        <OverrideModal
          open={Boolean(overrideTarget)}
          date={date}
          target={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onSaved={() => {
            setOverrideTarget(null);
            loadReport();
          }}
        />
      ) : null}
    </div>
  );
}
