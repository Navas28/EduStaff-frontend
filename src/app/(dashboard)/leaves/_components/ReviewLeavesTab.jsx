"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";
import RejectLeaveModal from "./RejectLeaveModal";
import SubstitutePlanModal from "./SubstitutePlanModal";

const STATUS_FILTERS = ["PENDING", "APPROVED", "REJECTED", "ALL"];

export default function ReviewLeavesTab() {
  const { hasPermission } = useAuth();
  const canAssignSubstitute = hasPermission("ASSIGN_SUBSTITUTE");

  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [substituteTarget, setSubstituteTarget] = useState(null);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
      const { data } = await apiFetch(`/leaves${params}`);
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching leave requests on mount/filter change
    loadLeaves();
  }, [loadLeaves]);

  const handleApprove = async (id) => {
    setError("");
    try {
      await apiFetch(`/leaves/${id}/approve`, { method: "PATCH" });
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ease-out ${
              statusFilter === status
                ? "bg-ink text-white"
                : "border border-border-surface bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

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
                Staff
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Type
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Dates
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Reason
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-surface">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-6">
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-ink-muted">
                  No leave requests here.
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="px-6 py-3 text-ink">{leave.userId?.name}</td>
                  <td className="px-6 py-3 text-ink-muted">{leave.leaveType}</td>
                  <td className="px-6 py-3 text-ink-muted">
                    {leave.startDate === leave.endDate
                      ? leave.startDate
                      : `${leave.startDate} – ${leave.endDate}`}
                  </td>
                  <td className="px-6 py-3 text-ink-muted">{leave.reason}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-3">
                      {leave.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(leave._id)}
                            className="text-sm font-semibold text-chalkboard hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectTarget(leave)}
                            className="text-sm font-semibold text-stamp-red hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                      {leave.status === "APPROVED" && canAssignSubstitute ? (
                        <button
                          type="button"
                          onClick={() => setSubstituteTarget(leave)}
                          className="text-sm font-semibold text-ink hover:underline"
                        >
                          Manage substitutes
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {rejectTarget ? (
        <RejectLeaveModal
          open={Boolean(rejectTarget)}
          leave={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => {
            setRejectTarget(null);
            loadLeaves();
          }}
        />
      ) : null}

      {substituteTarget ? (
        <SubstitutePlanModal
          open={Boolean(substituteTarget)}
          leave={substituteTarget}
          onClose={() => setSubstituteTarget(null)}
        />
      ) : null}
    </div>
  );
}
