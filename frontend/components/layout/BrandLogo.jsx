"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

function HeritageLogo({ compact = false, showTagline = true, className }) {
  const rawId = useId().replace(/:/g, "");
  const glowId = `${rawId}-glow`;
  const shieldId = `${rawId}-shield`;
  const flagBlueId = `${rawId}-flag-blue`;
  const flagRedId = `${rawId}-flag-red`;
  const roofBlueId = `${rawId}-roof-blue`;
  const roofRedId = `${rawId}-roof-red`;
  const statueId = `${rawId}-statue`;
  const flareId = `${rawId}-flare`;
  const shadowId = `${rawId}-shadow`;
  const viewBox = showTagline ? "0 0 760 360" : "0 12 760 292";

  return (
    <svg
      viewBox={viewBox}
      aria-label="BienesRaicesCR"
      className={cn(
        "h-auto",
        compact
          ? "w-[13.6rem] min-w-[13.6rem] sm:w-[14.5rem]"
          : "w-[min(100%,34rem)] min-w-[18rem]",
        className
      )}
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#79c3ff" stopOpacity="0.78" />
          <stop offset="38%" stopColor="#1d5fc7" stopOpacity="0.45" />
          <stop offset="76%" stopColor="#09152c" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#09152c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={shieldId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#103d99" />
          <stop offset="55%" stopColor="#0d2d74" />
          <stop offset="100%" stopColor="#081b4c" />
        </linearGradient>
        <linearGradient id={flagBlueId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#082d8d" />
          <stop offset="52%" stopColor="#2d8cf1" />
          <stop offset="100%" stopColor="#07276d" />
        </linearGradient>
        <linearGradient id={flagRedId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#d3131f" />
          <stop offset="50%" stopColor="#ff1f2d" />
          <stop offset="100%" stopColor="#dd1426" />
        </linearGradient>
        <linearGradient id={roofBlueId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#1b54cb" />
          <stop offset="100%" stopColor="#0c2a72" />
        </linearGradient>
        <linearGradient id={roofRedId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ff2230" />
          <stop offset="100%" stopColor="#c90b1c" />
        </linearGradient>
        <linearGradient id={statueId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#b8bbc5" />
          <stop offset="50%" stopColor="#595e68" />
          <stop offset="100%" stopColor="#212734" />
        </linearGradient>
        <radialGradient id={flareId} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fff5bc" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffcc59" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#ffcc59" stopOpacity="0" />
        </radialGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#04112c" floodOpacity="0.32" />
        </filter>
      </defs>

      <ellipse cx="404" cy="154" rx="258" ry="142" fill={`url(#${glowId})`} />
      <ellipse cx="122" cy="80" rx="76" ry="86" fill={`url(#${flareId})`} opacity="0.9" />

      <g filter={`url(#${shadowId})`}>
        <g transform="translate(30 30)">
          <path
            d="M54 230 80 221 79 182 75 133 86 88 98 64 120 56 131 71 126 98 133 131 148 168 158 218 141 226 130 184 114 149 96 166 82 210 81 230 54 230Z"
            fill={`url(#${statueId})`}
            stroke="#1d2430"
            strokeWidth="3"
          />
          <path
            d="M118 58 128 16 141 12 149 29 141 59Z"
            fill={`url(#${statueId})`}
            stroke="#1d2430"
            strokeWidth="3"
          />
          <path
            d="M128 7c9 6 14 15 14 28-11-3-19-9-24-19 4-5 7-8 10-9Z"
            fill="#ffb13d"
            stroke="#ffe2ab"
            strokeWidth="2"
          />
          <path d="M35 230h55v41H35Z" fill="#6f7682" stroke="#222a39" strokeWidth="3" />
          <path d="M35 230c12-9 31-13 49-13l11 13Z" fill="#444c5d" />
        </g>

        <g transform="translate(182 14)">
          <path
            d="M94 84c66-49 144-64 230-50 46 7 96 17 156 7 47-8 93-3 129 20v43c-38-20-78-26-123-19-64 10-120 2-175-7-86-15-155-4-217 35Z"
            fill={`url(#${flagBlueId})`}
            stroke="#07215d"
            strokeWidth="3"
          />
          <path
            d="M70 126c69-44 146-59 232-48 55 7 104 20 168 12 51-6 100 0 142 23v43c-42-18-87-23-137-16-72 10-129 1-185-9-86-15-162-9-220 17Z"
            fill="#ffffff"
          />
          <path
            d="M44 163c73-44 153-55 240-42 66 10 116 22 187 14 58-7 109 1 145 26v48c-45-21-96-27-156-18-78 11-137 0-201-11-84-14-161-8-215 16Z"
            fill={`url(#${flagRedId})`}
          />
          <path
            d="M82 203c75-33 157-41 247-29 66 9 120 18 191 10 49-5 87-1 118 10v28H72Z"
            fill="#ffffff"
          />
          <path
            d="M72 228c69-27 145-33 229-23 73 9 130 18 209 8 46-6 84-4 124 5v24H62Z"
            fill={`url(#${flagBlueId})`}
          />
          <circle cx="244" cy="112" r="36" fill="#ffffff" stroke="#dbdce3" strokeWidth="5" />
          <circle cx="244" cy="112" r="22" fill="#c9a64a" />
          <circle cx="244" cy="112" r="15" fill="#2f94ff" />
        </g>

        <path
          d="M124 251c114-44 278-55 474-38 57 5 111 13 164 24-64 3-114 8-175 21-174 36-325 30-463-7-5-1-8-1 0 0Z"
          fill="#ffffff"
          opacity="0.9"
        />

        <g transform="translate(292 118)">
          <path d="M0 119 118 10l117 109v82H0Z" fill="#fefefe" stroke="#e6eef8" strokeWidth="4" />
          <path d="M-16 123 118 -2l132 125h-44L118 39 27 123H-16Z" fill={`url(#${roofRedId})`} stroke="#ffffff" strokeWidth="8" />
          <path d="M172 113 254 38l82 75v88h-164Z" fill="#ffffff" stroke="#dfe8f6" strokeWidth="4" />
          <path d="M152 115 254 20l102 95h-38L254 56l-65 59h-37Z" fill={`url(#${roofBlueId})`} stroke="#ffffff" strokeWidth="8" />
          <path d="M308 121 382 54l74 68v79H308Z" fill="#ffffff" stroke="#dfe8f6" strokeWidth="4" />
          <path d="M290 123 382 35l91 88h-33L382 70l-59 53h-33Z" fill={`url(#${roofRedId})`} stroke="#ffffff" strokeWidth="8" />

          <rect x="93" y="83" width="14" height="46" fill={`url(#${roofRedId})`} />
          <rect x="70" y="104" width="25" height="25" fill="#0c2a72" />
          <rect x="98" y="104" width="25" height="25" fill="#0c2a72" />
          <rect x="231" y="74" width="19" height="19" fill="#0c2a72" />
          <rect x="257" y="74" width="19" height="19" fill="#0c2a72" />
          <rect x="197" y="154" width="36" height="47" fill={`url(#${roofBlueId})`} />
          <rect x="360" y="111" width="22" height="22" fill="#0c2a72" />
          <rect x="388" y="111" width="22" height="22" fill="#0c2a72" />
        </g>

        <path
          d="M160 250c144-8 351-14 456-6 72 5 115 10 144 18l-52 6c-57 7-99 13-145 29-132 47-315 51-484 4-36-10-68-17-95-22l176-29Z"
          fill={`url(#${shieldId})`}
          stroke="#ffffff"
          strokeWidth="7"
        />
        <path
          d="M171 243c110-10 274-19 438-8 79 5 123 10 149 17-51-1-97 1-144 8-111 17-197 16-321 6-56-5-105-10-122-23Z"
          fill="#0f4ec0"
          opacity="0.75"
        />

        <text
          x="185"
          y="314"
          fill="#ffffff"
          stroke="#0a1947"
          strokeWidth="4"
          paintOrder="stroke"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={compact ? "78" : "92"}
          fontWeight="700"
          letterSpacing="-1.4"
        >
          BienesRaices
        </text>
        <text
          x={compact ? "574" : "613"}
          y="314"
          fill="#ff1026"
          stroke="#62000d"
          strokeWidth="3"
          paintOrder="stroke"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={compact ? "86" : "102"}
          fontWeight="700"
          letterSpacing="-2"
        >
          CR
        </text>

        {showTagline ? (
          <>
            <path d="M236 334c56-11 96-13 142-12" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
            <path d="M504 334c59-12 98-14 150-13" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
            <text
              x="378"
              y="344"
              textAnchor="middle"
              fill="#ffffff"
              stroke="#123777"
              strokeWidth="1.5"
              paintOrder="stroke"
              fontFamily="'Segoe Script', 'Brush Script MT', cursive"
              fontSize="48"
              fontWeight="700"
            >
              Tu llave al exito
            </text>
          </>
        ) : null}
      </g>
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
  return (
    <div
      className={cn(
        "inline-flex items-center",
        textClassName,
        titleClassName,
        className
      )}
    >
      <HeritageLogo compact={compact} showTagline={showTagline} className={iconClassName} />
    </div>
  );
}
