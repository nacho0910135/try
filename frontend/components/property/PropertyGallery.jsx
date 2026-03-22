"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Images, PlayCircle } from "lucide-react";

const fallbackSrc = "/property-placeholder.svg";

const normalizeGalleryItems = ({ media = [], photos = [], title }) => {
  const normalizedMedia = (media || [])
    .filter((item) => item?.url)
    .map((item, index) => ({
      id: `${item.type || "image"}-${index}-${item.url}`,
      type: item.type || "image",
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || item.url,
      alt: item.alt || title,
      isPrimary: Boolean(item.isPrimary),
      order: Number(item.order ?? index)
    }))
    .sort((first, second) => {
      if (first.isPrimary !== second.isPrimary) {
        return first.isPrimary ? -1 : 1;
      }

      return first.order - second.order;
    });

  if (normalizedMedia.length) {
    return normalizedMedia;
  }

  if (photos.length) {
    return photos.map((photo, index) => ({
      id: `photo-${index}-${photo.url}`,
      type: "image",
      url: photo.url,
      thumbnailUrl: photo.url,
      alt: photo.alt || title,
      isPrimary: Boolean(photo.isPrimary),
      order: index
    }));
  }

  return [
    {
      id: "placeholder-media",
      type: "image",
      url: fallbackSrc,
      thumbnailUrl: fallbackSrc,
      alt: title
    }
  ];
};

const isEmbeddableVideo = (url = "") =>
  /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|vimeo\.com\//i.test(url);

const toEmbedUrl = (url = "") => {
  if (!url) return url;

  if (/youtube\.com\/embed\//i.test(url)) {
    return url;
  }

  const youtubeWatch = url.match(/[?&]v=([^&]+)/i);
  if (youtubeWatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
  }

  const youtubeShort = url.match(/youtu\.be\/([^?&]+)/i);
  if (youtubeShort?.[1]) {
    return `https://www.youtube.com/embed/${youtubeShort[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
};

function GalleryViewer({ item, title }) {
  if (item.type === "video") {
    if (/\.mp4($|\?)/i.test(item.url)) {
      return (
        <video
          key={item.id}
          src={item.url}
          poster={item.thumbnailUrl || fallbackSrc}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover bg-black"
        />
      );
    }

    if (isEmbeddableVideo(item.url)) {
      return (
        <iframe
          key={item.id}
          src={toEmbedUrl(item.url)}
          title={item.alt || title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 bg-black"
        />
      );
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0f1720] text-white">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur"
        >
          <PlayCircle className="h-4 w-4" />
          Abrir video
        </a>
      </div>
    );
  }

  return (
    <img
      key={item.id}
      src={item.url || fallbackSrc}
      alt={item.alt || title}
      className="absolute inset-0 h-full w-full object-cover"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}

export function PropertyGallery({ media = [], photos = [], title }) {
  const items = useMemo(() => normalizeGalleryItems({ media, photos, title }), [media, photos, title]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];
  const imageCount = items.filter((item) => item.type === "image").length;
  const videoCount = items.filter((item) => item.type === "video").length;

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length]);

  const goTo = (nextIndex) => {
    if (!items.length) return;

    if (nextIndex < 0) {
      setActiveIndex(items.length - 1);
      return;
    }

    if (nextIndex >= items.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(nextIndex);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[30px] border border-white/60 bg-[#0f1720] shadow-[0_28px_60px_rgba(15,23,32,0.18)]">
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur sm:gap-2 sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
            <Images className="h-3.5 w-3.5" />
            {imageCount} fotos
            {videoCount ? <span className="text-white/75">{"\u00b7"} {videoCount} videos</span> : null}
          </div>
          <div className="rounded-full bg-white/85 px-2.5 py-1.5 text-[10px] font-semibold text-ink shadow-soft backdrop-blur sm:px-3 sm:text-[11px]">
            {activeItem.type === "video" ? "Video destacado" : "Portada visual"}
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
          <GalleryViewer item={activeItem} title={title} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/8 to-transparent" />
        </div>

        {items.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2.5 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-white/88 p-2 text-ink shadow-soft transition hover:bg-white sm:left-4 sm:p-2.5"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2.5 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-white/88 p-2 text-ink shadow-soft transition hover:bg-white sm:right-4 sm:p-2.5"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="flex snap-x gap-2.5 overflow-x-auto pb-1 sm:gap-3">
          {items.map((item, index) => {
            const selected = index === activeIndex;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative aspect-[4/3] min-w-[92px] snap-start overflow-hidden rounded-[20px] border bg-white shadow-soft transition sm:min-w-[132px] ${
                  selected
                    ? "border-terracotta ring-2 ring-terracotta/18"
                    : "border-white/70 hover:-translate-y-0.5 hover:border-ink/10"
                }`}
              >
                {item.type === "video" ? (
                  <>
                    <img
                      src={item.thumbnailUrl || fallbackSrc}
                      alt={item.alt || title}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackSrc;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-white/88 p-2 text-ink shadow-soft">
                        <PlayCircle className="h-4 w-4" />
                      </span>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.thumbnailUrl || fallbackSrc}
                    alt={item.alt || title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackSrc;
                    }}
                  />
                )}
                <div className="absolute inset-x-2 bottom-2">
                  <span className="rounded-full bg-black/50 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur sm:px-2.5 sm:text-[10px]">
                    {item.type === "video" ? "Video" : `Foto ${index + 1}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
