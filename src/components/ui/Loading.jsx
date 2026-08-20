export function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border-surface border-t-chalkboard" />
      {label}
    </div>
  );
}

export function LoadingScreen({ label = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Loading label={label} />
    </div>
  );
}
