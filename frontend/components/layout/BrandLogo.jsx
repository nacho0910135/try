"use client";

import { useId } from "react";
import { useLanguage } from "@/components/layout/LanguageProvider";
import { cn } from "@/lib/utils";

function FlagHouseMark({ compact = false, className }) {
  const rawId = useId().replace(/:/g, "");
  const skyId = `${rawId}-sky`;
  const blueId = `${rawId}-blue`;
  const redId = `${rawId}-red`;
  const houseId = `${rawId}-house`;
  const groundId = `${rawId}-ground`;
  const shadowId = `${rawId}-shadow`;

  return (
    <svg
      viewBox="0 0 188 148"
      aria-hidden="true"
      className={cn(
        compact
          ? "h-[2.7rem] w-[3.45rem] sm:h-[3.8rem] sm:w-[4.85rem]"
          : "h-[4.6rem] w-[5.9rem] sm:h-[6.1rem] sm:w-[7.8rem]",
        className
      )}
    >
      <defs>
        <linearGradient id={skyId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ecf5ff" />
          <stop offset="100%" stopColor="#d8ebff" />
        </linearGradient>
        <linearGradient id={blueId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#0d3f96" />
          <stop offset="100%" stopColor="#1a66d2" />
        </linearGradient>
        <linearGradient id={redId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#d91422" />
          <stop offset="100%" stopColor="#ff2c3c" />
        </linearGradient>
        <linearGradient id={houseId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#174cb4" />
          <stop offset="100%" stopColor="#0b2f76" />
        </linearGradient>
        <linearGradient id={groundId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#71b82c" />
          <stop offset="100%" stopColor="#2f8d19" />
        </linearGradient>
        <filter id={shadowId} x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0b1732" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path
          d="M18 33c20-13 47-17 82-14 25 2 45 7 65 4 12-2 21-1 29 3v47c-10-4-20-5-31-3-21 4-42 1-64-3-31-5-55-4-81 10V33Z"
          fill={`url(#${blueId})`}
        />
        <path
          d="M11 51c26-13 52-17 84-13 26 3 47 8 69 5 13-2 22-1 30 3v25c-9-3-19-4-31-2-24 3-45 0-70-5-31-6-54-4-82 9V51Z"
          fill="#ffffff"
        />
        <path
          d="M7 68c28-12 55-15 86-10 30 5 50 10 76 7 11-1 19 0 26 2v24c-9-2-18-2-28 0-28 4-50 0-80-5-30-5-54-4-80 7V68Z"
          fill={`url(#${redId})`}
        />
        <path
          d="M12 89c27-9 54-11 86-8 29 3 53 7 79 4 8-1 14-1 19 0v18H12V89Z"
          fill="#ffffff"
        />
        <path
          d="M18 105c25-5 51-5 81-2 31 3 59 5 95 0v12H18v-10Z"
          fill={`url(#${blueId})`}
        />

        <path
          d="M28 122c23-10 45-14 66-13 18 2 35 7 52 8 10 1 24 0 40-3-9 10-23 17-41 21H69c-17-2-31-7-41-13Z"
          fill={`url(#${groundId})`}
        />
        <path d="M44 124c16-6 31-8 46-6 8 1 18 4 28 8" fill="none" stroke="#1f5e14" strokeWidth="4" strokeLinecap="round" />
        <path d="M97 125c13-5 27-7 42-6" fill="none" stroke="#1f5e14" strokeWidth="4" strokeLinecap="round" />

        <ellipse cx="114" cy="48" rx="15" ry="15" fill="#ffffff" stroke="#d6dde8" strokeWidth="2" />
        <circle cx="114" cy="48" r="8" fill="#1f7b35" opacity="0.9" />

        <path d="M49 99 85 68l35 31v24H49V99Z" fill={`url(#${houseId})`} stroke="#09265f" strokeWidth="3" />
        <path d="M42 102 85 62l42 40h-14L85 76 56 102H42Z" fill={`url(#${redId})`} stroke="#ffffff" strokeWidth="4" />
        <path d="M107 97 134 73l28 24v26h-55V97Z" fill={`url(#${houseId})`} stroke="#09265f" strokeWidth="3" />
        <path d="M98 99 134 66l35 31h-12l-23-20-24 22H98Z" fill={`url(#${blueId})`} stroke="#ffffff" strokeWidth="4" />

        <rect x="69" y="93" width="12" height="12" rx="1.4" fill="#ffffff" />
        <rect x="83" y="93" width="12" height="12" rx="1.4" fill="#ffffff" />
        <rect x="79" y="107" width="15" height="16" rx="1.6" fill="#ffffff" />
        <rect x="123" y="97" width="11" height="11" rx="1.2" fill="#ffffff" />
        <rect x="136" y="97" width="11" height="11" rx="1.2" fill="#ffffff" />
      </g>
    </svg>
  );
}

function BrandWordmark({ compact = false, showTagline = true, className }) {
  const { t } = useLanguage();

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn(
          "flex items-baseline leading-none tracking-tight",
          compact ? "gap-1.5" : "gap-2"
        )}
      >
        <span
          className={cn(
            "font-serif font-semibold text-[#0d3f96]",
            compact
              ? "text-[1.08rem] sm:text-[1.55rem]"
              : "text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem]"
          )}
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
        >
          BienesRaices
        </span>
        <span
          className={cn(
            "font-serif font-bold text-[#e01e2d]",
            compact
              ? "text-[1.22rem] sm:text-[1.72rem]"
              : "text-[2.18rem] sm:text-[2.95rem] lg:text-[3.45rem]"
          )}
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
        >
          CR
        </span>
      </div>

      {showTagline ? (
        <div className="mt-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-ink/60 sm:text-[0.8rem]">
          {t("brand.tagline")}
        </div>
      ) : null}
    </div>
  );
}

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  titleClassName,
  compact = false,
  showTagline = true
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center",
        compact ? "gap-1.5 sm:gap-2.5" : "gap-2.5 sm:gap-4",
        className
      )}
    >
      <FlagHouseMark compact={compact} className={iconClassName} />
      <BrandWordmark
        compact={compact}
        showTagline={showTagline}
        className={cn(textClassName, titleClassName)}
      />
    </div>
  );
}
