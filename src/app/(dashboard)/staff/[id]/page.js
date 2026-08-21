"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/Loading";
import StatusBadge from "@/components/ui/StatusBadge";
import ProfileInfoCard from "./_components/ProfileInfoCard";
import AccountCard from "./_components/AccountCard";
import AllocationCard from "./_components/AllocationCard";
import ClassTeacherCard from "./_components/ClassTeacherCard";
import CredentialsModal from "../_components/CredentialsModal";

export default function StaffDetailPage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await apiFetch(`/staff/${id}`);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching staff profile on mount
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    apiFetch("/roles")
      .then(({ data }) => setRoles(data))
      .catch(() => setRoles([]));
    apiFetch("/staff/classes")
      .then(({ data }) => setClasses(data))
      .catch(() => setClasses([]));
    apiFetch("/staff/subjects")
      .then(({ data }) => setSubjects(data))
      .catch(() => setSubjects([]));
  }, []);

  if (loading) return <LoadingScreen />;

  if (!profile) {
    return (
      <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
        {error || "Staff profile not found"}
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/staff" className="text-sm font-semibold text-ink-muted hover:text-ink">
          ← Staff directory
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-ink">{profile.userId?.name}</h1>
          <StatusBadge status={profile.userId?.status} />
        </div>
        <p className="text-sm text-ink-muted">
          {profile.staffCode} · {profile.designation}
        </p>
      </div>

      {error ? (
        <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
          {error}
        </p>
      ) : null}

      <ProfileInfoCard profile={profile} onUpdated={setProfile} onError={setError} />

      <AccountCard
        profile={profile}
        roles={roles}
        onUpdated={loadProfile}
        onError={setError}
        onCredentials={setCredentials}
      />

      {profile.staffType === "TEACHING" ? (
        <>
          <AllocationCard
            profile={profile}
            subjects={subjects}
            classes={classes}
            onUpdated={setProfile}
            onError={setError}
          />
          <ClassTeacherCard profile={profile} onUpdated={setProfile} onError={setError} />
        </>
      ) : null}

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </div>
  );
}
