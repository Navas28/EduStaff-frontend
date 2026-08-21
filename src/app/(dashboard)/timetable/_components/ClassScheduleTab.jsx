"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import TimetableGrid from "./TimetableGrid";
import SlotEditorModal from "./SlotEditorModal";

export default function ClassScheduleTab({ days, periods, classes, subjects }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_TIMETABLE");

  const [classId, setClassId] = useState(classes[0] || "");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingCell, setEditingCell] = useState(null);
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirst, setSwapFirst] = useState(null);

  const loadSlots = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const { data } = await apiFetch(`/timetable/class/${classId}`);
      setSlots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching this class's schedule on mount/class change
    loadSlots();
  }, [loadSlots]);

  const handleCellClick = async (day, periodNumber, slot) => {
    if (swapMode) {
      if (!slot) return;
      if (!swapFirst) {
        setSwapFirst(slot);
        return;
      }
      if (swapFirst._id === slot._id) {
        setSwapFirst(null);
        return;
      }
      setError("");
      try {
        await apiFetch("/timetable/slots/swap", {
          method: "PATCH",
          body: JSON.stringify({ slotIdA: swapFirst._id, slotIdB: slot._id }),
        });
        setSwapFirst(null);
        setSwapMode(false);
        loadSlots();
      } catch (err) {
        setError(err.message);
        setSwapFirst(null);
      }
      return;
    }

    setEditingCell({ day, periodNumber, slot });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          id="class-picker"
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
          className="w-40"
        >
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              Class {cls}
            </option>
          ))}
        </Select>

        {canManage ? (
          <Button
            type="button"
            variant={swapMode ? "primary" : "secondary"}
            onClick={() => {
              setSwapMode((mode) => !mode);
              setSwapFirst(null);
            }}
          >
            {swapMode
              ? swapFirst
                ? "Select the period to swap with..."
                : "Select a period to swap"
              : "Swap periods"}
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading />
      ) : (
        <TimetableGrid
          days={days}
          periods={periods}
          slots={slots}
          selectedCellId={swapFirst ? `${swapFirst.dayOfWeek}-${swapFirst.periodNumber}` : null}
          onCellClick={canManage ? handleCellClick : undefined}
          renderCell={(day, periodNumber, slot) =>
            slot ? (
              <div>
                <p className="text-sm font-semibold text-ink">{slot.subject}</p>
                <p className="text-xs text-ink-muted">{slot.teacherId?.userId?.name}</p>
              </div>
            ) : canManage ? (
              <p className="text-xs text-ink-muted">+ Add</p>
            ) : (
              <p className="text-xs text-ink-muted">Free</p>
            )
          }
        />
      )}

      {editingCell ? (
        <SlotEditorModal
          open={Boolean(editingCell)}
          classId={classId}
          day={editingCell.day}
          periodNumber={editingCell.periodNumber}
          slot={editingCell.slot}
          subjects={subjects}
          onClose={() => setEditingCell(null)}
          onSaved={() => {
            setEditingCell(null);
            loadSlots();
          }}
          onCleared={() => {
            setEditingCell(null);
            loadSlots();
          }}
        />
      ) : null}
    </div>
  );
}
