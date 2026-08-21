"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Loading } from "@/components/ui/Loading";
import TimetableGrid from "./TimetableGrid";

const DAY_INDEX = { MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5 };

function getCurrentSlotKey(periods) {
  const now = new Date();
  const day = Object.keys(DAY_INDEX).find((key) => DAY_INDEX[key] === now.getDay());
  if (!day) return null;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const period = periods.find((item) => {
    const [startH, startM] = item.startTime.split(":").map(Number);
    const [endH, endM] = item.endTime.split(":").map(Number);
    return minutesNow >= startH * 60 + startM && minutesNow < endH * 60 + endM;
  });

  return period ? `${day}-${period.periodNumber}` : null;
}

export default function MyScheduleTab({ days, periods }) {
  const [schedule, setSchedule] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/timetable/my-schedule")
      .then(({ data }) => setSchedule(data))
      .catch((err) => setError(err.message));
  }, []);

  const currentSlotKey = getCurrentSlotKey(periods);

  if (error) {
    return (
      <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
        {error}
      </p>
    );
  }

  if (schedule === undefined) {
    return <Loading />;
  }

  if (!schedule) {
    return (
      <p className="text-sm text-ink-muted">
        No staff profile is linked to your account, so there&apos;s no personal schedule to show
        yet.
      </p>
    );
  }

  return (
    <TimetableGrid
      days={days}
      periods={periods}
      slots={schedule.slots}
      renderCell={(day, periodNumber, slot) => {
        const isCurrent = `${day}-${periodNumber}` === currentSlotKey;
        return (
          <div>
            {slot ? (
              <p className="text-sm font-semibold text-ink">
                {slot.classId} ({slot.subject})
              </p>
            ) : (
              <span className="inline-flex items-center rounded-sm border-[1.5px] border-chalkboard bg-chalkboard-tint px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-chalkboard">
                Free period
              </span>
            )}
            {isCurrent ? (
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-marigold">
                Now
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
