import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-ink/10 bg-white text-ink/70",
  accent: "border-terracotta/20 bg-terracotta/10 text-terracotta",
  success: "border-pine/20 bg-pine/10 text-pine",
  info: "border-lagoon/20 bg-lagoon/10 text-lagoon"
};

export function Badge({ children, variant = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

