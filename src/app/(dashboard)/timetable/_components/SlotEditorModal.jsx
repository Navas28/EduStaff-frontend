"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function SlotEditorModal({
  open,
  classId,
  day,
  periodNumber,
  slot,
  subjects,
  onClose,
  onSaved,
  onCleared,
}) {
  const [subject, setSubject] = useState(slot?.subject || "");
  const [teacherId, setTeacherId] = useState(slot?.teacherId?._id || "");
  const [eligibleTeachers, setEligibleTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!subject) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching eligible teachers when the subject changes
    setLoadingTeachers(true);
    const params = new URLSearchParams({
      classId,
      subject,
      dayOfWeek: day,
      periodNumber: String(periodNumber),
    });
    if (slot?._id) params.set("excludeSlotId", slot._id);

    apiFetch(`/timetable/eligible-teachers?${params.toString()}`)
      .then(({ data }) => setEligibleTeachers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTeachers(false));
  }, [subject, classId, day, periodNumber, slot]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/timetable/slots", {
        method: "POST",
        body: JSON.stringify({ classId, dayOfWeek: day, periodNumber, subject, teacherId }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!slot) return;
    setError("");
    setSubmitting(true);
    try {
      await apiFetch(`/timetable/slots/${slot._id}`, { method: "DELETE" });
      onCleared();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const dayLabel = day.charAt(0) + day.slice(1).toLowerCase();

  return (
    <Modal open={open} onClose={onClose} title={`${classId} · ${dayLabel} · Period ${periodNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="slot-subject"
          label="Subject"
          required
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value);
            setTeacherId("");
          }}
        >
          <option value="">Select a subject</option>
          {subjects.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0) + item.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>

        <Select
          id="slot-teacher"
          label="Teacher"
          required
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
          disabled={!subject || loadingTeachers}
        >
          <option value="">
            {!subject
              ? "Select a subject first"
              : loadingTeachers
                ? "Loading..."
                : "Select a teacher"}
          </option>
          {(subject ? eligibleTeachers : []).map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.userId?.name} ({teacher.staffCode})
            </option>
          ))}
        </Select>

        {subject && !loadingTeachers && eligibleTeachers.length === 0 ? (
          <p className="text-xs text-ink-muted">
            No qualified, free, authorized teacher is available for this subject at this time.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-2">
          {slot ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleClear}
              disabled={submitting}
            >
              Clear period
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !teacherId}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
