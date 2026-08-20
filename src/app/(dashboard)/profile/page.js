"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          Profile
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">{user?.name}</h1>
        <p className="text-sm text-ink-muted">{user?.email}</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-ink">Change password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="current-password"
            label="Current password"
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            id="new-password"
            label="New password"
            type="password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          {error ? (
            <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-sm border-[1.5px] border-chalkboard bg-chalkboard-tint px-3 py-2 text-sm text-chalkboard">
              {success}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
