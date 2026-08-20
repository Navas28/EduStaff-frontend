const STATUS_TONE = {
  PRESENT: "chalkboard",
  APPROVED: "chalkboard",
  PUBLISHED: "chalkboard",
  PAID: "chalkboard",
  ACTIVE: "chalkboard",
  GENERAL: "chalkboard",
  LATE: "marigold",
  HALF_DAY: "marigold",
  PENDING: "marigold",
  DRAFT: "marigold",
  ON_LEAVE: "marigold",
  IMPORTANT: "marigold",
  ABSENT: "stamp-red",
  REJECTED: "stamp-red",
  ARCHIVED: "stamp-red",
  URGENT: "stamp-red",
};

const TONE_STYLES = {
  chalkboard: "border-chalkboard text-chalkboard bg-chalkboard-tint",
  marigold: "border-marigold text-marigold bg-marigold-tint",
  "stamp-red": "border-stamp-red text-stamp-red bg-stamp-red-tint",
};

export default function StatusBadge({ status, tone, rotate = "left", className = "" }) {
  const resolvedTone = tone ?? STATUS_TONE[status] ?? "chalkboard";
  const rotation = rotate === "right" ? "rotate-[1.5deg]" : "-rotate-2";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-sm border-[1.5px] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] ${TONE_STYLES[resolvedTone]} ${rotation} ${className}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
