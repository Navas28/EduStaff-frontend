"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LineItemsEditor from "@/components/ui/LineItemsEditor";

export default function EditPayrollModal({ open, record, onClose, onSaved }) {
  const [earnings, setEarnings] = useState(
    record.earnings.map(({ title, amount }) => ({ title, amount }))
  );
  const [deductions, setDeductions] = useState(
    record.deductions.map(({ title, amount }) => ({ title, amount }))
  );
  const [unpaidAbsentDays, setUnpaidAbsentDays] = useState(record.unpaidAbsentDays);
  const [absentDeductionAmount, setAbsentDeductionAmount] = useState(record.absentDeductionAmount);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch(`/payroll/${record._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          earnings,
          deductions,
          unpaidAbsentDays: Number(unpaidAbsentDays),
          absentDeductionAmount: Number(absentDeductionAmount),
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit payroll — ${record.staffId?.userId?.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <LineItemsEditor label="Earnings" items={earnings} onChange={setEarnings} />
        <LineItemsEditor label="Deductions" items={deductions} onChange={setDeductions} />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="unpaid-days"
            label="Unpaid absent days"
            type="number"
            min="0"
            value={unpaidAbsentDays}
            onChange={(event) => setUnpaidAbsentDays(event.target.value)}
          />
          <Input
            id="absent-deduction"
            label="Absent deduction amount"
            type="number"
            min="0"
            value={absentDeductionAmount}
            onChange={(event) => setAbsentDeductionAmount(event.target.value)}
          />
        </div>

        {error ? (
          <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
