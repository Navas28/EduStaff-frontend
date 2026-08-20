"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import RoleFormModal from "./_components/RoleFormModal";

function formatPermission(key) {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch("/roles");
      setRoles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching roles on mount
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    apiFetch("/roles/permissions")
      .then(({ data }) => setPermissions(data))
      .catch(() => setPermissions([]));
  }, []);

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`/roles/${id}`, { method: "DELETE" });
      loadRoles();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Access Control
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Roles &amp; permissions</h1>
        </div>
        <Button onClick={openCreate}>Create role</Button>
      </div>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Loading />
        ) : roles.length === 0 ? (
          <p className="text-sm text-ink-muted">No roles yet — create one to get started.</p>
        ) : (
          roles.map((role) => (
            <Card key={role._id}>
              <h2 className="text-base font-semibold text-ink">{role.name}</h2>
              {role.description ? (
                <p className="mt-1 text-sm text-ink-muted">{role.description}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {role.permissions.length === 0 ? (
                  <span className="text-xs text-ink-muted">No permissions assigned</span>
                ) : (
                  role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-sm bg-paper px-2 py-1 text-[11px] font-medium text-ink-muted"
                    >
                      {formatPermission(permission)}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(role)}
                  className="text-sm font-semibold text-ink hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(role._id)}
                  className="text-sm font-semibold text-stamp-red hover:underline"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {modalOpen ? (
        <RoleFormModal
          key={editingRole?._id || "create"}
          role={editingRole}
          permissions={permissions}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            loadRoles();
          }}
        />
      ) : null}
    </div>
  );
}
