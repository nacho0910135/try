"use client";

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-white hover:bg-[#18324b] shadow-[0_16px_30px_rgba(17,34,54,0.16)]",
  secondary: "bg-white text-ink hover:bg-mist shadow-[0_10px_24px_rgba(17,34,54,0.08)]",
  accent: "bg-terracotta text-white hover:bg-[#9d502f] shadow-[0_16px_30px_rgba(157,80,47,0.22)]",
  success: "bg-pine text-white hover:bg-[#2c6847] shadow-[0_16px_30px_rgba(44,104,71,0.22)]",
  ghost: "bg-transparent text-ink hover:bg-white/70",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_16px_30px_rgba(220,38,38,0.2)]"
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
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
