"use client";

import { useState } from "react";

export function PropertyGallery({ photos = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const fallbackSrc = "/property-placeholder.svg";
  const safePhotos = photos.length
    ? photos
    : [{ url: fallbackSrc, alt: title }];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px]">
        <img
          src={safePhotos[activeIndex]?.url || fallbackSrc}
          alt={safePhotos[activeIndex]?.alt || title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackSrc;
          }}
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {safePhotos.slice(0, 4).map((photo, index) => (
          <button
            key={`${photo.url}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-[4/3] overflow-hidden rounded-2xl border ${
              activeIndex === index ? "border-terracotta" : "border-white/70"
            }`}
          >
            <img
              src={photo.url || fallbackSrc}
              alt={photo.alt || title}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackSrc;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
