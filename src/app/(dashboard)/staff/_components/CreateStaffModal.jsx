"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

export default function CreateStaffModal({ open, roles, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setName("");
    setEmail("");
    setRoleId("");
    setError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, roleId: roleId || undefined }),
      });
      setName("");
      setEmail("");
      setRoleId("");
      onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={resetAndClose} title="Add staff account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="staff-name"
          label="Full name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Priya Sharma"
        />
        <Input
          id="staff-email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="priya.sharma@school.com"
        />
        <Select
          id="staff-role"
          label="Role"
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
        >
          <option value="">No role (assign later)</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </Select>

        {error ? (
          <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
