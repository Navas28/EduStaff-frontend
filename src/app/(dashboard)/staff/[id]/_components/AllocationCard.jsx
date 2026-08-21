"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function AllocationCard({ profile, subjects, classes, onUpdated, onError }) {
  const { hasPermission } = useAuth();
  const canAllocate = hasPermission("ALLOCATE_TEACHER_CLASSES");
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(profile.qualifiedSubject || "");
  const [selectedClasses, setSelectedClasses] = useState(profile.assignedClasses || []);
  const [submitting, setSubmitting] = useState(false);

  const startEditing = () => {
    setSubject(profile.qualifiedSubject || "");
    setSelectedClasses(profile.assignedClasses || []);
    setEditing(true);
  };

  const toggleClass = (classId) => {
    setSelectedClasses((current) =>
      current.includes(classId)
        ? current.filter((item) => item !== classId)
        : [...current, classId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onError("");
    setSubmitting(true);
    try {
      const { data } = await apiFetch(`/staff/${profile._id}/allocation`, {
        method: "PATCH",
        body: JSON.stringify({ qualifiedSubject: subject, assignedClasses: selectedClasses }),
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
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Teaching allocation</h2>
          {canAllocate ? (
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
              Qualified subject
            </dt>
            <dd className="text-ink">{profile.qualifiedSubject || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Authorized classes
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {profile.assignedClasses.length === 0 ? (
                <span className="text-ink-muted">No classes assigned</span>
              ) : (
                profile.assignedClasses.map((classId) => (
                  <span
                    key={classId}
                    className="rounded-sm bg-paper px-2 py-1 text-xs font-medium text-ink-muted"
                  >
                    {classId}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink">Edit teaching allocation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="allocation-subject"
          label="Qualified subject"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        >
          <option value="">Select a subject</option>
          {subjects.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Authorized classes
          </p>
          <div className="grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto rounded-md border border-border bg-paper p-3">
            {classes.map((classId) => (
              <label key={classId} className="flex items-center gap-1.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(classId)}
                  onChange={() => toggleClass(classId)}
                  className="h-4 w-4 rounded border-border text-chalkboard focus:ring-chalkboard"
                />
                {classId}
              </label>
            ))}
          </div>
        </div>

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
            {submitting ? "Saving..." : "Save allocation"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
