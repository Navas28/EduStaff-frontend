"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ClassTeacherCard({ profile, onUpdated, onError }) {
  const { hasPermission } = useAuth();
  const canAllocate = hasPermission("ALLOCATE_TEACHER_CLASSES");
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = async (event) => {
    event.preventDefault();
    onError("");
    setSubmitting(true);
    try {
      const { data } = await apiFetch(`/staff/${profile._id}/class-teacher`, {
        method: "PATCH",
        body: JSON.stringify({ classId: selected }),
      });
      setSelected("");
      onUpdated(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    onError("");
    setSubmitting(true);
    try {
      const { data } = await apiFetch(`/staff/${profile._id}/class-teacher`, {
        method: "PATCH",
        body: JSON.stringify({ classId: null }),
      });
      onUpdated(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-ink">Class teacher</h2>
      <p className="mb-4 text-sm text-ink-muted">
        {profile.classTeacherOf
          ? `Class teacher of ${profile.classTeacherOf}.`
          : "Not currently a class teacher."}
      </p>

      {canAllocate ? (
        profile.classTeacherOf ? (
          <Button variant="destructive" onClick={handleRemove} disabled={submitting}>
            Remove class-teacher assignment
          </Button>
        ) : profile.assignedClasses.length === 0 ? (
          <p className="text-xs text-ink-muted">
            Assign this teacher to at least one authorized class before making them a class
            teacher.
          </p>
        ) : (
          <form onSubmit={handleAssign} className="flex items-end gap-3">
            <div className="flex-1">
              <label
                htmlFor="class-teacher-select"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted"
              >
                Assign as class teacher of
              </label>
              <select
                id="class-teacher-select"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                required
                className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard"
              >
                <option value="">Select a class</option>
                {profile.assignedClasses.map((classId) => (
                  <option key={classId} value={classId}>
                    {classId}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={submitting}>
              Assign
            </Button>
          </form>
        )
      ) : null}
    </Card>
  );
}
