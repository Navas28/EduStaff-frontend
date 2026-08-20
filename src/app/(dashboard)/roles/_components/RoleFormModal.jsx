"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function formatPermission(key) {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Mount this component fresh (e.g. via a `key` on the parent) each time it opens for a
// different role, so its form state can simply initialize from props instead of syncing via an effect.
export default function RoleFormModal({ role, permissions, onClose, onSaved }) {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [selectedPermissions, setSelectedPermissions] = useState(role?.permissions || []);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const togglePermission = (permission) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { name, description, permissions: selectedPermissions };
      if (role) {
        await apiFetch(`/roles/${role._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/roles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={role ? "Edit role" : "Create role"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="role-name"
          label="Role name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Accountant"
        />
        <Input
          id="role-description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this role is for"
        />

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Permissions
          </p>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-border bg-paper p-3">
            {permissions.map((permission) => (
              <label key={permission} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="h-4 w-4 rounded border-border text-chalkboard focus:ring-chalkboard"
                />
                {formatPermission(permission)}
              </label>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
