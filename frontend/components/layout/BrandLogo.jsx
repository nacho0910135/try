"use client";

import { useLanguage } from "@/components/layout/LanguageProvider";
import { cn } from "@/lib/utils";

function ScenicMark({ compact = false, className }) {
  return (
    <svg
      viewBox="0 0 250 180"
      aria-hidden="true"
      className={cn(compact ? "h-14 w-[5.1rem]" : "h-24 w-[8.8rem]", className)}
    >
      <defs>
        <linearGradient id="markSky" x1="0%" x2="100%" y1="10%" y2="100%">
          <stop offset="0%" stopColor="#1545a8" />
          <stop offset="100%" stopColor="#0d2f78" />
        </linearGradient>
        <linearGradient id="markRoof" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ffd23f" />
          <stop offset="100%" stopColor="#ff960f" />
        </linearGradient>
        <linearGradient id="markHouse" x1="0%" x2="100%" y1="10%" y2="100%">
          <stop offset="0%" stopColor="#184bb0" />
          <stop offset="100%" stopColor="#0b2d72" />
        </linearGradient>
        <linearGradient id="markPalm" x1="0%" x2="100%" y1="10%" y2="100%">
          <stop offset="0%" stopColor="#9be000" />
          <stop offset="100%" stopColor="#3d9000" />
        </linearGradient>
        <linearGradient id="markGround" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#d2ff17" />
          <stop offset="100%" stopColor="#74c200" />
        </linearGradient>
        <clipPath id="markOvalClip">
          <ellipse cx="126" cy="78" rx="93" ry="66" />
        </clipPath>
      </defs>

      <ellipse cx="126" cy="78" rx="94" ry="67" fill="url(#markSky)" stroke="#0b2b68" strokeWidth="4" />
      <g clipPath="url(#markOvalClip)">
        <path d="M18 38c38-11 76-13 130-10 41 2 74 12 102 31v56H0V63c17-8 29-16 18-25Z" fill="#f6f7fb" />
        <path d="M0 96c48-31 118-43 250-18v29H0V96Z" fill="#133f9e" opacity="0.96" />
        <path d="M0 95c50-22 100-36 181-34 24 1 48 5 69 13v17H0V95Z" fill="#fdfdfd" />
        <path d="M0 89c57-31 108-43 169-40 19 1 44 6 81 19v25H0V89Z" fill="#e91418" />
        <path d="M0 65c54-25 116-37 188-34 18 1 39 5 62 15v18H0V65Z" fill="#fdfdfd" opacity="0.98" />
        <circle cx="70" cy="58" r="12" fill="#ffffff" stroke="#d7dbe4" strokeWidth="3" />
        <circle cx="70" cy="58" r="7" fill="#2e8a22" opacity="0.9" />
      </g>

      <path d="M23 135c30-12 61-16 94-10 13 3 30 8 45 10 23 3 47 2 72-3-13 10-31 18-54 24H77c-22-3-39-10-54-21Z" fill="#1f5e0f" opacity="0.9" />
      <path d="M30 137c29-11 61-14 89-9 15 3 35 9 54 11 18 2 40 0 57-4-17 15-43 25-72 29H90c-24-4-45-12-60-27Z" fill="url(#markGround)" stroke="#428700" strokeWidth="3" />
      <path d="M56 144c29-8 55-10 83-7 12 2 25 5 40 11" fill="none" stroke="#2d5600" strokeWidth="5" strokeLinecap="round" />
      <path d="M116 145c22-10 46-14 76-11" fill="none" stroke="#244700" strokeWidth="5" strokeLinecap="round" />

      <path d="M162 52c11 16 17 39 20 72h-10c-4-27-9-49-18-72h8Z" fill="#7d4304" stroke="#5d2f00" strokeWidth="2" />
      <path d="M191 88c5 8 8 20 9 35h-8c-1-13-4-24-8-34l7-1Z" fill="#844300" stroke="#5d2f00" strokeWidth="2" />

      <g fill="url(#markPalm)" stroke="#2b6f00" strokeWidth="3" strokeLinejoin="round">
        <path d="M160 51c17-17 42-22 63-16-16 8-29 20-38 34-5-7-12-13-25-18Z" />
        <path d="M157 53c-2-23 12-39 34-48-5 18-4 34 5 49-13-3-24-4-39-1Z" />
        <path d="M158 54c-19-11-39-10-57-2 14 3 27 11 37 25 6-9 11-15 20-23Z" />
        <path d="M161 57c5 20-1 38-16 53-1-18-8-31-22-41 15-2 27-5 38-12Z" />
        <path d="M191 83c8-9 18-11 28-7-7 4-12 9-16 17-3-4-6-7-12-10Z" />
        <path d="M189 85c0-12 7-22 18-28-2 11-1 20 4 29-7-1-13-2-22-1Z" />
        <path d="M188 85c-10-6-21-6-31-1 7 2 14 6 20 14 3-5 6-9 11-13Z" />
      </g>

      <path d="M74 96 116 66l42 31v36H74V96Z" fill="url(#markHouse)" stroke="#09285e" strokeWidth="4" />
      <path d="M59 102 116 56l58 42h-19l-39-28-38 28H59Z" fill="url(#markRoof)" stroke="#e67b00" strokeWidth="4" />
      <path d="M146 82h-18l12-10h33c-7 4-16 7-27 10Z" fill="#ffd960" opacity="0.7" />

      <rect x="91" y="94" width="21" height="24" rx="2.5" fill="#f7f7fb" />
      <rect x="127" y="95" width="26" height="22" rx="2.5" fill="#f7f7fb" />
      <path d="M101.5 94v24M91 106h21M140 95v22" stroke="#1f4da7" strokeWidth="3" />
    </svg>
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
  const { t } = useLanguage();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ScenicMark compact={compact} className={iconClassName} />

      <div className={cn("min-w-0", textClassName)}>
        <div
          className={cn(
            compact ? "text-[2rem]" : "text-[2.8rem] sm:text-[3.5rem]",
            "font-serif font-semibold leading-none tracking-tight",
            titleClassName
          )}
        >
          <span
            className="drop-shadow-[0_2px_0_rgba(255,255,255,0.55)]"
            style={{
              color: "#0b3f95",
              WebkitTextStroke: "1px rgba(240,244,255,0.55)"
            }}
          >
            Alquiventas
          </span>
          <span
            className="drop-shadow-[0_2px_0_rgba(255,255,255,0.4)]"
            style={{
              color: "#7cc400",
              WebkitTextStroke: "1px rgba(37,78,10,0.18)"
            }}
          >
            CR
          </span>
        </div>
        {showTagline ? (
          <div className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-ink/55 sm:text-[0.78rem]">
            {t("brand.tagline")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
