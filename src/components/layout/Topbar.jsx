"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function BellIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-surface bg-surface px-6">
      <input
        type="search"
        placeholder="Search staff, classes, records..."
        className="w-full max-w-sm rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-chalkboard"
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalkboard"
        >
          <BellIcon className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-chalkboard text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalkboard"
          >
            {initial}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border-surface bg-surface p-1 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-ink">{user?.name}</p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-border-surface" />
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-paper"
              >
                Profile settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-stamp-red hover:bg-stamp-red-tint"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
