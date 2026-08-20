export default function Input({ label, id, className = "", ...props }) {
  return (
    <div>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={`w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-chalkboard ${className}`}
        {...props}
      />
    </div>
  );
}
