"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Loading } from "@/components/ui/Loading";
import CreateStaffModal from "./_components/CreateStaffModal";
import CredentialsModal from "./_components/CredentialsModal";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch(`/users?status=${statusFilter}`);
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching staff on mount / filter change
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    apiFetch("/roles")
      .then(({ data }) => setRoles(data))
      .catch(() => setRoles([]));
  }, []);

  const handleArchive = async (id) => {
    setError("");
    try {
      await apiFetch(`/users/${id}/archive`, { method: "PATCH" });
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async (id) => {
    setError("");
    try {
      await apiFetch(`/users/${id}/restore`, { method: "PATCH" });
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (id) => {
    setError("");
    try {
      const { data } = await apiFetch(`/users/${id}/reset-password`, { method: "POST" });
      setCredentials(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (id, roleId) => {
    setError("");
    try {
      await apiFetch(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ roleId: roleId || null }),
      });
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Staff Directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Staff accounts</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Add staff account</Button>
      </div>

      <div className="flex gap-2">
        {["ACTIVE", "ARCHIVED"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ease-out ${
              statusFilter === status
                ? "bg-ink text-white"
                : "border border-border-surface bg-surface text-ink-muted hover:text-ink"
            }`}
          >
            {status === "ACTIVE" ? "Active" : "Archived"}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-surface">
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Name
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Email
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Role
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-surface">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-6">
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-ink-muted">
                  No {statusFilter === "ACTIVE" ? "active" : "archived"} staff accounts yet.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member._id}>
                  <td className="px-6 py-3 font-medium text-ink">
                    {member.name}
                    {member.isSuperAdmin ? (
                      <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                        Super Admin
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-3 text-ink-muted">{member.email}</td>
                  <td className="px-6 py-3">
                    {member.isSuperAdmin ? (
                      <span className="text-ink-muted">—</span>
                    ) : (
                      <select
                        value={member.roleId?._id || ""}
                        onChange={(event) => handleRoleChange(member._id, event.target.value)}
                        disabled={member.status === "ARCHIVED"}
                        className="rounded-md border border-border bg-paper px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-chalkboard disabled:opacity-50"
                      >
                        <option value="">No role</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3">
                      {!member.isSuperAdmin && member.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => handleArchive(member._id)}
                          className="text-sm font-semibold text-stamp-red hover:underline"
                        >
                          Archive
                        </button>
                      ) : null}
                      {member.status === "ARCHIVED" ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(member._id)}
                          className="text-sm font-semibold text-chalkboard hover:underline"
                        >
                          Restore
                        </button>
                      ) : null}
                      {!member.isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleResetPassword(member._id)}
                          className="text-sm font-semibold text-ink hover:underline"
                        >
                          Reset password
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <CreateStaffModal
        open={createOpen}
        roles={roles}
        onClose={() => setCreateOpen(false)}
        onCreated={(data) => {
          setCreateOpen(false);
          setCredentials(data);
          loadStaff();
        }}
      />

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </div>
  );
}
