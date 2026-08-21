"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";

export default function CheckInTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [result, setResult] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/attendance/me");
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching attendance history on mount
    loadHistory();
  }, [loadHistory]);

  const handleCheckIn = () => {
    setError("");
    setResult(null);

    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }

    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data } = await apiFetch("/attendance/check-in", {
            method: "POST",
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });
          setResult(data);
          loadHistory();
        } catch (err) {
          setError(err.message);
        } finally {
          setCheckingIn(false);
        }
      },
      () => {
        setError("Location access was denied. Enable it to mark attendance.");
        setCheckingIn(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Mark today&apos;s attendance</h2>
            <p className="mt-1 text-sm text-ink-muted">
              You must be on the school campus for this to work.
            </p>
          </div>
          <Button onClick={handleCheckIn} disabled={checkingIn}>
            {checkingIn ? "Checking in..." : "Mark attendance"}
          </Button>
        </div>

        {result ? (
          <div className="mt-4 flex items-center gap-2">
            <StatusBadge status={result.status} />
            <span className="text-sm text-ink-muted">Marked successfully.</span>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}
      </Card>

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-border-surface px-6 py-4">
          <h2 className="text-base font-semibold text-ink">History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-surface">
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Date
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Marked by
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-surface">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-6">
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-ink-muted">
                  No attendance history yet.
                </td>
              </tr>
            ) : (
              history.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-3 text-ink">{record.date}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-3 text-ink-muted">
                    {record.markedBy === "SELF" ? "You" : "Admin"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
