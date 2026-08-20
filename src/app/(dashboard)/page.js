import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

const TODAYS_ATTENDANCE = [
  { name: "Mr. Sharma", status: "PRESENT" },
  { name: "Mrs. Iyer", status: "LATE" },
  { name: "Mr. Rao", status: "ABSENT" },
  { name: "Ms. Fernandes", status: "ON_LEAVE" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Overview
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Good morning, Admin</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Staff present today
          </p>
          <p className="mt-2 text-4xl font-bold text-ink">42</p>
        </Card>
        <Card>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Pending leave requests
          </p>
          <p className="mt-2 text-4xl font-bold text-ink">3</p>
        </Card>
        <Card>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Payroll status
          </p>
          <div className="mt-3">
            <StatusBadge status="DRAFT" />
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Today&apos;s attendance
        </p>
        <div className="mt-4 divide-y divide-border-surface">
          {TODAYS_ATTENDANCE.map((row) => (
            <div key={row.name} className="flex items-center justify-between py-3">
              <span className="text-sm text-ink">{row.name}</span>
              <StatusBadge status={row.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
