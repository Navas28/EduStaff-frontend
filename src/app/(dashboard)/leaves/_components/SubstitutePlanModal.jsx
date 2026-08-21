"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";

const keyFor = (item) => `${item.date}-${item.periodNumber}-${item.classId}`;

export default function SubstitutePlanModal({ open, leave, onClose }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selections, setSelections] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch(`/leaves/${leave._id}/substitute-plan`);
      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [leave._id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the substitute plan on open
    loadPlan();
  }, [loadPlan]);

  const handleAssign = async (item) => {
    const key = keyFor(item);
    const substituteTeacherId = selections[key];
    if (!substituteTeacherId) return;

    setError("");
    setSavingKey(key);
    try {
      await apiFetch(`/leaves/${leave._id}/substitute`, {
        method: "POST",
        body: JSON.stringify({
          date: item.date,
          periodNumber: item.periodNumber,
          classId: item.classId,
          substituteTeacherId,
        }),
      });
      loadPlan();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleRemove = async (item) => {
    if (!item.existingDuty) return;
    setError("");
    setSavingKey(keyFor(item));
    try {
      await apiFetch(`/leaves/substitute/${item.existingDuty._id}`, { method: "DELETE" });
      loadPlan();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Substitute allocation — ${leave.userId?.name}`}>
      {error ? (
        <p className="mb-4 rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading />
      ) : !plan || plan.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No scheduled teaching periods fall within this leave&apos;s date range.
        </p>
      ) : (
        <div className="max-h-[28rem] space-y-3 overflow-y-auto">
          {plan.map((item) => {
            const key = keyFor(item);
            const dayLabel = item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase();

            return (
              <div key={key} className="rounded-md border border-border-surface p-3">
                <p className="text-sm font-semibold text-ink">
                  {item.date} ({dayLabel}) · Period {item.periodNumber}
                </p>
                <p className="text-xs text-ink-muted">
                  {item.classId} · {item.subject}
                </p>

                {item.existingDuty ? (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-chalkboard">
                      Covered by {item.existingDuty.substituteTeacherId?.userId?.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={savingKey === key}
                      className="text-sm font-semibold text-stamp-red hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={selections[key] || ""}
                      onChange={(event) =>
                        setSelections((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className="flex-1 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard"
                    >
                      <option value="">
                        {item.candidates.length === 0
                          ? "No free teachers available"
                          : "Select a substitute"}
                      </option>
                      {item.candidates.map((candidate) => (
                        <option key={candidate._id} value={candidate._id}>
                          {candidate.subjectMatch ? "⭐ " : ""}
                          {candidate.name} ({candidate.staffCode})
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={() => handleAssign(item)}
                      disabled={!selections[key] || savingKey === key}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
