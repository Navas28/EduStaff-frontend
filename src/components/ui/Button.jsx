const VARIANT_STYLES = {
  primary: "bg-chalkboard text-white hover:bg-chalkboard/90",
  secondary: "bg-surface text-ink border border-ink hover:bg-paper",
  destructive: "bg-stamp-red text-white hover:bg-stamp-red/90",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalkboard disabled:pointer-events-none disabled:opacity-50 ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}
