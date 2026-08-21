"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Loading } from "@/components/ui/Loading";
import ClassScheduleTab from "./_components/ClassScheduleTab";
import MyScheduleTab from "./_components/MyScheduleTab";

const TABS = [
  { id: "class", label: "By class" },
  { id: "mine", label: "My schedule" },
];

export default function TimetablePage() {
  const [tab, setTab] = useState("class");
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/timetable/days"),
      apiFetch("/timetable/periods"),
      apiFetch("/staff/classes"),
      apiFetch("/staff/subjects"),
    ])
      .then(([daysRes, periodsRes, classesRes, subjectsRes]) => {
        setConfig({
          days: daysRes.data,
          periods: periodsRes.data,
          classes: classesRes.data,
          subjects: subjectsRes.data,
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Academic Schedule
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Timetable</h1>
      </div>

      <div className="flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ease-out ${
              tab === item.id
                ? "bg-ink text-white"
                : "border border-border-surface bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : !config ? (
        <Loading />
      ) : tab === "class" ? (
        <ClassScheduleTab
          days={config.days}
          periods={config.periods}
          classes={config.classes}
          subjects={config.subjects}
        />
      ) : (
        <MyScheduleTab days={config.days} periods={config.periods} />
      )}
    </div>
  );
}
