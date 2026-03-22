"use client";

import { useLanguage } from "@/components/layout/LanguageProvider";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  titleClassName,
  compact = false,
  showTagline = true
}) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 152 104"
        aria-hidden="true"
        className={cn(compact ? "h-12 w-16" : "h-14 w-20", iconClassName)}
      >
        <defs>
          <linearGradient id="roofGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ffb52f" />
            <stop offset="100%" stopColor="#ff6d1f" />
          </linearGradient>
          <linearGradient id="houseGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#0f4ea9" />
            <stop offset="100%" stopColor="#0b2d72" />
          </linearGradient>
          <linearGradient id="fieldGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#78c92f" />
            <stop offset="100%" stopColor="#2f8f2c" />
          </linearGradient>
        </defs>

        <path
          d="M14 80c19-11 44-14 73-8 12 3 24 7 38 6-10 9-23 16-41 18H31C24 92 18 87 14 80Z"
          fill="url(#fieldGradient)"
        />
        <path
          d="M34 83c15-7 33-9 54-5"
          fill="none"
          stroke="#2c7b2b"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M46 88c12-5 28-6 42-3"
          fill="none"
          stroke="#2c7b2b"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path d="M87 28c9 7 16 22 18 42h-9c-2-18-6-31-15-43l6 1Z" fill="#b55f39" />
        <path
          d="M74 22c10 0 18 6 22 14-7-3-13-3-20-1 2-4 5-8 10-13h-12Zm13 3c8 0 16 3 22 9-7-2-14-2-21 1 1-4 3-7 6-10h-7Zm-17 8c8-1 15 0 22 5-7 0-13 2-19 6 1-4 3-8 7-11h-10Zm5 12c8-2 16-1 24 4-9 1-16 4-22 9 0-4 2-8 5-13Z"
          fill="#69b312"
          stroke="#377d16"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M18 53 46 35l30 20v26H18V53Z" fill="url(#houseGradient)" />
        <path d="M10 56 46 28l36 28H68L46 39 24 56H10Z" fill="url(#roofGradient)" />
        <rect x="32" y="57" width="14" height="16" rx="1.5" fill="#f3f8ff" />
        <rect x="53" y="58" width="18" height="14" rx="1.5" fill="#f3f8ff" />
        <path d="M39 57v16M32 65h14M62 58v14" stroke="#0f4ea9" strokeWidth="1.8" />
      </svg>

      <div className={cn("min-w-0", textClassName)}>
        <div
          className={cn(
            compact ? "text-2xl" : "text-3xl sm:text-[2.2rem]",
            "font-serif font-semibold leading-none tracking-tight",
            titleClassName
          )}
        >
          <span style={{ color: "#0c3f92" }}>AlquiVentas</span>
          <span style={{ color: "#69b312" }}>CR</span>
        </div>
        {showTagline ? (
          <div className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-ink/45 sm:text-[0.74rem]">
            {t("brand.tagline")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
