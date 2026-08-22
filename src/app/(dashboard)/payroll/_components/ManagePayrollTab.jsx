"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiDownload } from "@/lib/api";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";
import EditPayrollModal from "./EditPayrollModal";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ManagePayrollTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch(`/payroll?month=${month}&year=${year}`);
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching payroll records on mount/filter change
    loadRecords();
  }, [loadRecords]);

  const handleGenerate = async () => {
    setError("");
    setGenerating(true);
    try {
      await apiFetch("/payroll/generate", {
        method: "POST",
        body: JSON.stringify({ month, year }),
      });
      loadRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (id) => {
    setError("");
    try {
      await apiFetch(`/payroll/${id}/publish`, { method: "PATCH" });
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkPaid = async (id) => {
    setError("");
    try {
      await apiFetch(`/payroll/${id}/mark-paid`, { method: "PATCH" });
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownload = async (record) => {
    setError("");
    try {
      await apiDownload(
        `/payroll/${record._id}/download`,
        `payslip-${record.staffId?.staffCode}-${record.month}-${record.year}.pdf`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-3">
          <Select
            id="payroll-month"
            label="Month"
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </Select>
          <Select
            id="payroll-year"
            label="Year"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Generate draft"}
        </Button>
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
                Gross
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Deductions
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Net
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
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-ink-muted">
                  No payroll records for this month yet. Generate a draft to get started.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-3 text-ink">{record.staffId?.userId?.name}</td>
                  <td className="px-6 py-3 text-ink-muted">
                    ₹{record.grossSalary.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3 text-ink-muted">
                    ₹{record.totalDeductions.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3 text-ink">₹{record.netSalary.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-3">
                      {record.status === "DRAFT" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditTarget(record)}
                            className="text-sm font-semibold text-ink hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublish(record._id)}
                            className="text-sm font-semibold text-chalkboard hover:underline"
                          >
                            Publish
                          </button>
                        </>
                      ) : null}
                      {record.status === "PUBLISHED" ? (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(record._id)}
                          className="text-sm font-semibold text-chalkboard hover:underline"
                        >
                          Mark paid
                        </button>
                      ) : null}
                      {record.status !== "DRAFT" ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(record)}
                          className="text-sm font-semibold text-ink hover:underline"
                        >
                          Download
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

      {editTarget ? (
        <EditPayrollModal
          open={Boolean(editTarget)}
          record={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            loadRecords();
          }}
        />
      ) : null}
    </div>
  );
}
