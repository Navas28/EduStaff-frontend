"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import StatusBadge from "@/components/ui/StatusBadge";
import AddStaffWizard from "./_components/AddStaffWizard";
import CredentialsModal from "./_components/CredentialsModal";

const STAFF_TYPE_LABEL = {
  TEACHING: "Teaching",
  NON_TEACHING: "Non-Teaching",
};

export default function StaffPage() {
  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      if (search) params.set("search", search);
      const { data } = await apiFetch(`/staff?${params.toString()}`);
      setProfiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching staff on mount / filter change
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    apiFetch("/roles")
      .then(({ data }) => setRoles(data))
      .catch(() => setRoles([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            Staff Directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Staff</h1>
        </div>
        <Button onClick={() => setWizardOpen(true)}>Add staff</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search name, staff ID, or phone..."
          className="ml-auto w-full max-w-xs rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-chalkboard"
        />
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
                Staff ID
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Name
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Type
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Designation
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Subject
              </th>
              <th className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-surface">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-6">
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-ink-muted">
                  No {statusFilter === "ACTIVE" ? "active" : "archived"} staff yet.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile._id} className="hover:bg-paper/60">
                  <td className="px-6 py-3 font-medium text-ink">
                    <Link href={`/staff/${profile._id}`} className="hover:underline">
                      {profile.staffCode}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-ink">{profile.userId?.name}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-paper px-2 py-1 text-xs font-medium text-ink-muted">
                      {STAFF_TYPE_LABEL[profile.staffType]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-muted">{profile.designation}</td>
                  <td className="px-6 py-3 text-ink-muted">{profile.qualifiedSubject || "—"}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={profile.userId?.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <AddStaffWizard
        open={wizardOpen}
        roles={roles}
        onClose={() => setWizardOpen(false)}
        onCreated={(data) => {
          setWizardOpen(false);
          setCredentials(data);
          loadProfiles();
        }}
      />

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </div>
  );
}
