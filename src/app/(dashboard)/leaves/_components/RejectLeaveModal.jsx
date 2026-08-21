"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RejectLeaveModal({ open, leave, onClose, onRejected }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch(`/leaves/${leave._id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ rejectionReason }),
      });
      onRejected();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Reject leave — ${leave.userId?.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="rejection-reason"
          label="Rejection reason"
          required
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          placeholder="e.g. Scheduled for exam invigilation on this date"
        />

        {error ? (
          <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={submitting}>
            {submitting ? "Rejecting..." : "Reject leave"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
