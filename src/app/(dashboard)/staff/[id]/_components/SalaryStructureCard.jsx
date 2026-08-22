"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LineItemsEditor from "@/components/ui/LineItemsEditor";

const stripIds = (items = []) => items.map(({ title, amount }) => ({ title, amount }));

export default function SalaryStructureCard({ profile, onUpdated, onError }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_PAYROLL");
  const [editing, setEditing] = useState(false);
  const [baseSalary, setBaseSalary] = useState(profile.salaryStructure?.baseSalary || 0);
  const [allowances, setAllowances] = useState(stripIds(profile.salaryStructure?.allowances));
  const [deductions, setDeductions] = useState(stripIds(profile.salaryStructure?.deductions));
  const [submitting, setSubmitting] = useState(false);

  if (!canManage && !profile.salaryStructure?.baseSalary) {
    return null;
  }

  const startEditing = () => {
    setBaseSalary(profile.salaryStructure?.baseSalary || 0);
    setAllowances(stripIds(profile.salaryStructure?.allowances));
    setDeductions(stripIds(profile.salaryStructure?.deductions));
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onError("");
    setSubmitting(true);
    try {
      const { data } = await apiFetch(`/staff/${profile._id}/salary-structure`, {
        method: "PATCH",
        body: JSON.stringify({ baseSalary: Number(baseSalary), allowances, deductions }),
      });
      onUpdated(data);
      setEditing(false);
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing) {
    const allowanceTotal = (profile.salaryStructure?.allowances || []).reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const deductionTotal = (profile.salaryStructure?.deductions || []).reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return (
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Salary structure</h2>
          {canManage ? (
            <button
              type="button"
              onClick={startEditing}
              className="text-sm font-semibold text-ink hover:underline"
            >
              Edit
            </button>
          ) : null}
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Base salary
            </dt>
            <dd className="text-ink">
              ₹{(profile.salaryStructure?.baseSalary || 0).toLocaleString("en-IN")}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Allowances ({(profile.salaryStructure?.allowances || []).length})
            </dt>
            <dd className="text-ink">₹{allowanceTotal.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Deductions ({(profile.salaryStructure?.deductions || []).length})
            </dt>
            <dd className="text-ink">₹{deductionTotal.toLocaleString("en-IN")}</dd>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink">Edit salary structure</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="base-salary"
          label="Base salary"
          type="number"
          min="0"
          required
          value={baseSalary}
          onChange={(event) => setBaseSalary(event.target.value)}
        />
        <LineItemsEditor label="Allowances" items={allowances} onChange={setAllowances} />
        <LineItemsEditor label="Deductions" items={deductions} onChange={setDeductions} />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setEditing(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
