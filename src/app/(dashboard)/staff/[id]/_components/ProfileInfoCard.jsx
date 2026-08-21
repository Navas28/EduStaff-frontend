"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function ProfileInfoCard({ profile, onUpdated, onError }) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("MANAGE_STAFF");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    designation: profile.designation,
    phone: profile.phone,
    emergencyContact: profile.emergencyContact || "",
    gender: profile.gender,
    dob: toDateInputValue(profile.dob),
    joiningDate: toDateInputValue(profile.joiningDate),
    qualification: profile.qualification || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const startEditing = () => {
    setForm({
      designation: profile.designation,
      phone: profile.phone,
      emergencyContact: profile.emergencyContact || "",
      gender: profile.gender,
      dob: toDateInputValue(profile.dob),
      joiningDate: toDateInputValue(profile.joiningDate),
      qualification: profile.qualification || "",
    });
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onError("");
    setSubmitting(true);
    try {
      const { data } = await apiFetch(`/staff/${profile._id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      onUpdated(data);
      setEditing(false);
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Profile</h2>
          {canEdit ? (
            <button
              type="button"
              onClick={startEditing}
              className="text-sm font-semibold text-ink hover:underline"
            >
              Edit
            </button>
          ) : null}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Phone
            </dt>
            <dd className="text-ink">{profile.phone}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Emergency contact
            </dt>
            <dd className="text-ink">{profile.emergencyContact || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Gender
            </dt>
            <dd className="text-ink">
              {profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Date of birth
            </dt>
            <dd className="text-ink">{toDateInputValue(profile.dob)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Joining date
            </dt>
            <dd className="text-ink">{toDateInputValue(profile.joiningDate)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              Qualification
            </dt>
            <dd className="text-ink">{profile.qualification || "—"}</dd>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink">Edit profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="edit-designation"
          label="Designation"
          required
          value={form.designation}
          onChange={(event) => setForm({ ...form, designation: event.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="edit-phone"
            label="Phone"
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <Input
            id="edit-emergency"
            label="Emergency contact"
            value={form.emergencyContact}
            onChange={(event) => setForm({ ...form, emergencyContact: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="edit-gender"
            label="Gender"
            value={form.gender}
            onChange={(event) => setForm({ ...form, gender: event.target.value })}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Select>
          <Input
            id="edit-dob"
            label="Date of birth"
            type="date"
            required
            value={form.dob}
            onChange={(event) => setForm({ ...form, dob: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="edit-joining"
            label="Joining date"
            type="date"
            required
            value={form.joiningDate}
            onChange={(event) => setForm({ ...form, joiningDate: event.target.value })}
          />
          <Input
            id="edit-qualification"
            label="Qualification"
            value={form.qualification}
            onChange={(event) => setForm({ ...form, qualification: event.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setEditing(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
