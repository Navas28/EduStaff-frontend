"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";

export default function MyDutiesTab() {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDuties = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/leaves/substitute-duties/mine");
      setDuties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching own substitute duties on mount
    loadDuties();
  }, [loadDuties]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
        {error}
      </p>
    );
  }

  if (duties.length === 0) {
    return <p className="text-sm text-ink-muted">You have no substitute duties assigned.</p>;
  }

  return (
    <div className="space-y-3">
      {duties.map((duty) => (
        <Card key={duty._id}>
          <p className="text-sm font-semibold text-ink">
            {duty.date} · Period {duty.periodNumber}
          </p>
          <p className="text-sm text-ink-muted">
            {duty.classId} ({duty.subject}) — Covering for {duty.originalTeacherId?.userId?.name}
          </p>
        </Card>
      ))}
    </div>
  );
}
