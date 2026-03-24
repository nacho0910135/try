"use client";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-white/10 bg-[linear-gradient(135deg,#102132,#1d667b)] text-white hover:bg-[linear-gradient(135deg,#0d1b2a,#15576b)] shadow-[0_18px_34px_rgba(15,31,49,0.22)]",
  secondary:
    "border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,240,231,0.82))] text-ink hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(244,236,227,0.9))] shadow-[0_14px_30px_rgba(15,31,49,0.08)]",
  accent:
    "border border-white/10 bg-[linear-gradient(135deg,#b86443,#e28a57)] text-white hover:bg-[linear-gradient(135deg,#a65839,#d97c47)] shadow-[0_18px_34px_rgba(184,100,67,0.24)]",
  success:
    "border border-white/10 bg-[linear-gradient(135deg,#2f6452,#45826d)] text-white hover:bg-[linear-gradient(135deg,#285846,#3b745f)] shadow-[0_18px_34px_rgba(47,100,82,0.24)]",
  ghost:
    "border border-transparent bg-transparent text-ink hover:border-white/60 hover:bg-white/72",
  danger:
    "border border-red-500/10 bg-[linear-gradient(135deg,#dc2626,#ef4444)] text-white hover:bg-[linear-gradient(135deg,#c81d1d,#dd3131)] shadow-[0_18px_34px_rgba(220,38,38,0.2)]"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  ...props
}) {
  const Component = type === "button" && !onClick ? "span" : "button";

  return (
    <Component
      {...(Component === "button" ? { type, disabled, onClick } : {})}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold tracking-[0.01em] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
