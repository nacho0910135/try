export function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-3 text-sm text-ink/80">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border border-ink/20 text-terracotta focus:ring-terracotta/25"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

