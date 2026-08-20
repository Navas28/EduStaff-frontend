import DashboardShell from "@/components/layout/DashboardShell";
import RequireAuth from "@/components/auth/RequireAuth";

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
