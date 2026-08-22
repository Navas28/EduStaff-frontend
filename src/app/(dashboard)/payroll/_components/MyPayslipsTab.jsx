"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiDownload } from "@/lib/api";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";

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

export default function MyPayslipsTab() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/payroll/mine");
      setPayslips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching own payslips on mount
    loadPayslips();
  }, [loadPayslips]);

  const handleDownload = async (payslip) => {
    setError("");
    try {
      await apiDownload(
        `/payroll/${payslip._id}/download`,
        `payslip-${payslip.month}-${payslip.year}.pdf`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
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
                Month
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Net pay
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Payslip
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-surface">
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-ink-muted">
                  No published payslips yet.
                </td>
              </tr>
            ) : (
              payslips.map((payslip) => (
                <tr key={payslip._id}>
                  <td className="px-6 py-3 text-ink">
                    {MONTH_NAMES[payslip.month - 1]} {payslip.year}
                  </td>
                  <td className="px-6 py-3 text-ink-muted">
                    ₹{payslip.netSalary.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={payslip.status} />
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => handleDownload(payslip)}
                      className="text-sm font-semibold text-ink hover:underline"
                    >
                      Download PDF
                    </button>
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
