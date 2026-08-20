export default function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-lg border border-border-surface bg-surface p-6 ${className}`}
      {...props}
    />
  );
}
