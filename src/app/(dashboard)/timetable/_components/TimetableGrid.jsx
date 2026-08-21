export default function TimetableGrid({ days, periods, slots, renderCell, onCellClick, selectedCellId }) {
  const slotMap = new Map();
  slots.forEach((slot) => {
    slotMap.set(`${slot.dayOfWeek}-${slot.periodNumber}`, slot);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="w-24 px-3 py-2" />
            {days.map((day) => (
              <th
                key={day}
                className="px-3 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted"
              >
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.periodNumber} className="border-t border-border-surface">
              <td className="px-3 py-3 align-top">
                <p className="text-sm font-semibold text-ink">P{period.periodNumber}</p>
                <p className="text-xs text-ink-muted">
                  {period.startTime}–{period.endTime}
                </p>
              </td>
              {days.map((day) => {
                const cellKey = `${day}-${period.periodNumber}`;
                const slot = slotMap.get(cellKey);

                return (
                  <td key={cellKey} className="px-2 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => onCellClick?.(day, period.periodNumber, slot)}
                      disabled={!onCellClick}
                      className={`h-full w-full rounded-md border p-2 text-left transition-colors duration-150 ease-out ${
                        selectedCellId === cellKey
                          ? "border-chalkboard bg-chalkboard-tint"
                          : "border-border-surface bg-surface hover:border-chalkboard/50"
                      } ${!onCellClick ? "cursor-default" : ""}`}
                    >
                      {renderCell(day, period.periodNumber, slot)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
