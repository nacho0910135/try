"use client";

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-white hover:bg-[#18324b]",
  secondary: "bg-white text-ink hover:bg-mist",
  accent: "bg-terracotta text-white hover:bg-[#9d502f]",
  ghost: "bg-transparent text-ink hover:bg-white/70",
  danger: "bg-red-600 text-white hover:bg-red-700"
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
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
