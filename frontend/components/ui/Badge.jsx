import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,240,231,0.78))] text-ink/72",
  accent: "border-terracotta/20 bg-[linear-gradient(180deg,rgba(184,100,67,0.12),rgba(255,255,255,0.82))] text-terracotta",
  success: "border-pine/20 bg-[linear-gradient(180deg,rgba(47,100,82,0.12),rgba(255,255,255,0.82))] text-pine",
  info: "border-lagoon/20 bg-[linear-gradient(180deg,rgba(29,102,123,0.12),rgba(255,255,255,0.82))] text-lagoon"
};

export function Badge({ children, variant = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_8px_18px_rgba(15,31,49,0.05)] backdrop-blur",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
