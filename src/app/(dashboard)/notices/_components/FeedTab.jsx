"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";

export default function FeedTab() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/notices");
      setNotices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the notice feed on mount
    loadFeed();
  }, [loadFeed]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
        {error}
      </p>
    );
  }

  if (notices.length === 0) {
    return <p className="text-sm text-ink-muted">No notices right now.</p>;
  }

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <Card key={notice._id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {notice.isUnread ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-stamp-red"
                  aria-label="Unread"
                />
              ) : null}
              <h2 className="text-base font-semibold text-ink">{notice.title}</h2>
              {notice.isPinned ? (
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  Pinned
                </span>
              ) : null}
            </div>
            <StatusBadge status={notice.priority} />
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{notice.content}</p>
          <p className="mt-3 text-xs text-ink-muted">
            {notice.authorId?.name} · {new Date(notice.createdAt).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );
}
