"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const PRIORITIES = ["GENERAL", "IMPORTANT", "URGENT"];

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function NoticeFormModal({ notice, onClose, onSaved }) {
  const [title, setTitle] = useState(notice?.title || "");
  const [content, setContent] = useState(notice?.content || "");
  const [priority, setPriority] = useState(notice?.priority || "GENERAL");
  const [targetAudience, setTargetAudience] = useState(notice?.targetAudience || "ALL_STAFF");
  const [isPinned, setIsPinned] = useState(notice?.isPinned || false);
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(notice?.expiresAt));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title,
        content,
        priority,
        targetAudience,
        isPinned,
        expiresAt: expiresAt || null,
      };
      if (notice) {
        await apiFetch(`/notices/${notice._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/notices", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={notice ? "Edit notice" : "New notice"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="notice-title"
          label="Title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Staff Meeting: Term 1 Exam Schedule"
        />
        <div>
          <label
            htmlFor="notice-content"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted"
          >
            Content
          </label>
          <textarea
            id="notice-content"
            required
            rows={5}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-chalkboard"
            placeholder="Write the announcement..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="notice-priority"
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0) + item.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
          <Select
            id="notice-audience"
            label="Audience"
            value={targetAudience}
            onChange={(event) => setTargetAudience(event.target.value)}
          >
            <option value="ALL_STAFF">All staff</option>
            <option value="TEACHING_ONLY">Teaching only</option>
            <option value="NON_TEACHING_ONLY">Non-teaching only</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="notice-expires"
            label="Expires on (optional)"
            type="date"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
          <label className="mt-6 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(event) => setIsPinned(event.target.checked)}
              className="h-4 w-4 rounded border-border text-chalkboard focus:ring-chalkboard"
            />
            Pin to top of feed
          </label>
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
            {submitting ? "Saving..." : notice ? "Save changes" : "Publish"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
