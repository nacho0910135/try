"use client";

import Image from "next/image";
import { useState } from "react";

export function PropertyGallery({ photos = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safePhotos = photos.length
    ? photos
    : [{ url: "https://placehold.co/1400x900/png?text=Casa+CR", alt: title }];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px]">
        <Image
          src={safePhotos[activeIndex]?.url}
          alt={safePhotos[activeIndex]?.alt || title}
          fill
          className="object-cover"
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
            <Image src={photo.url} alt={photo.alt || title} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

