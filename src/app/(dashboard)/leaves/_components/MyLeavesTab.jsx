"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";

const LEAVE_TYPES = ["SICK", "CASUAL", "EMERGENCY"];

export default function MyLeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [leaveType, setLeaveType] = useState("SICK");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/leaves/mine");
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching own leave requests on mount
    loadLeaves();
  }, [loadLeaves]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await apiFetch("/leaves", {
        method: "POST",
        body: JSON.stringify({ leaveType, startDate, endDate, reason }),
      });
      setStartDate("");
      setEndDate("");
      setReason("");
      loadLeaves();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-base font-semibold text-ink">Apply for leave</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="leave-type"
            label="Leave type"
            value={leaveType}
            onChange={(event) => setLeaveType(event.target.value)}
          >
            {LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="leave-start"
              label="Start date"
              type="date"
              required
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <Input
              id="leave-end"
              label="End date"
              type="date"
              required
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <Input
            id="leave-reason"
            label="Reason"
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Briefly explain why you need this leave"
          />

          {formError ? (
            <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
              {formError}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </Card>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <div className="border-b border-border-surface px-6 py-4">
          <h2 className="text-base font-semibold text-ink">Your requests</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-surface">
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Type
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Dates
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Note
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
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-ink-muted">
                  No leave requests yet.
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="px-6 py-3 text-ink">{leave.leaveType}</td>
                  <td className="px-6 py-3 text-ink-muted">
                    {leave.startDate === leave.endDate
                      ? leave.startDate
                      : `${leave.startDate} – ${leave.endDate}`}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-6 py-3 text-ink-muted">
                    {leave.status === "REJECTED" ? leave.rejectionReason : "—"}
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
