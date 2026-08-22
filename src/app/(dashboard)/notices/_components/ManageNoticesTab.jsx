"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";
import NoticeFormModal from "./NoticeFormModal";

export default function ManageNoticesTab() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/notices/manage/all");
      setNotices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching all notices on mount
    loadNotices();
  }, [loadNotices]);

  const openCreate = () => {
    setEditingNotice(null);
    setModalOpen(true);
  };

  const openEdit = (notice) => {
    setEditingNotice(notice);
    setModalOpen(true);
  };

  const handleTogglePin = async (notice) => {
    setError("");
    try {
      await apiFetch(`/notices/${notice._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPinned: !notice.isPinned }),
      });
      loadNotices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`/notices/${id}`, { method: "DELETE" });
      loadNotices();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>New notice</Button>
      </div>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading />
      ) : notices.length === 0 ? (
        <p className="text-sm text-ink-muted">No notices yet.</p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">{notice.title}</h2>
                    {notice.isPinned ? (
                      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                        Pinned
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {notice.targetAudience.replace(/_/g, " ")}
                    {notice.expiresAt
                      ? ` · Expires ${new Date(notice.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <StatusBadge status={notice.priority} />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{notice.content}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(notice)}
                  className="text-sm font-semibold text-ink hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePin(notice)}
                  className="text-sm font-semibold text-ink hover:underline"
                >
                  {notice.isPinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(notice._id)}
                  className="text-sm font-semibold text-stamp-red hover:underline"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen ? (
        <NoticeFormModal
          key={editingNotice?._id || "create"}
          notice={editingNotice}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadNotices();
          }}
        />
      ) : null}
    </div>
  );
}
