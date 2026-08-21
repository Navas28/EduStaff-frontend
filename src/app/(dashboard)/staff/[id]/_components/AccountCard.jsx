"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AccountCard({ profile, roles, onUpdated, onError, onCredentials }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_STAFF");
  const [busy, setBusy] = useState(false);

  const user = profile.userId;

  const handleRoleChange = async (event) => {
    const roleId = event.target.value;
    onError("");
    setBusy(true);
    try {
      await apiFetch(`/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ roleId: roleId || null }),
      });
      onUpdated();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    onError("");
    setBusy(true);
    try {
      await apiFetch(`/users/${user._id}/archive`, { method: "PATCH" });
      onUpdated();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    onError("");
    setBusy(true);
    try {
      await apiFetch(`/users/${user._id}/restore`, { method: "PATCH" });
      onUpdated();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    onError("");
    setBusy(true);
    try {
      const { data } = await apiFetch(`/users/${user._id}/reset-password`, { method: "POST" });
      onCredentials(data);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink">Account</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Email
          </dt>
          <dd className="text-ink">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Role
          </dt>
          <dd className="text-ink">
            {canManage ? (
              <select
                value={user?.roleId?._id || ""}
                onChange={handleRoleChange}
                disabled={busy || user?.status === "ARCHIVED"}
                className="mt-1 rounded-md border border-border bg-paper px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard disabled:opacity-50"
              >
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            ) : (
              user?.roleId?.name || "—"
            )}
          </dd>
        </div>
      </dl>

      {canManage ? (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-border-surface pt-4">
          <Button variant="secondary" onClick={handleResetPassword} disabled={busy}>
            Reset password
          </Button>
          {user?.status === "ACTIVE" ? (
            <Button variant="destructive" onClick={handleArchive} disabled={busy}>
              Archive account
            </Button>
          ) : (
            <Button onClick={handleRestore} disabled={busy}>
              Restore account
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}
