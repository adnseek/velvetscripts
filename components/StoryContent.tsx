"use client";

import { useState } from "react";

export interface StoryImage {
  sectionIdx: number;
  heading?: string | null;
  filename: string;
}

interface StoryContentProps {
  content: string;
  images?: StoryImage[];
}

export default function StoryContent({ content, images = [] }: StoryContentProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  let h2Count = -1;
  let isFirstParagraphInSection = true;

  const imageMap = new Map<number, StoryImage>();
  for (const img of images) {
    if (img.filename) {
      imageMap.set(img.sectionIdx, img);
    }
  }

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxSrc(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 8));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Zoomable Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none"
          style={{ cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "zoom-in" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => {
            if (!isDragging && zoom <= 1) closeLightbox();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light z-10 w-10 h-10 flex items-center justify-center bg-black/50 rounded-full"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            ✕
          </button>

          {/* Zoom indicator + reset button */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <div className="text-white/50 text-sm font-mono bg-black/50 px-3 py-1 rounded-full">
              {Math.round(zoom * 100)}%
            </div>
            {zoom !== 1 && (
              <button
                className="text-white/70 hover:text-white text-xs bg-red-600/80 hover:bg-red-600 px-3 py-1 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Animated scroll-to-zoom hint */}
          {zoom === 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-hint">
              {/* Mouse icon with scrolling wheel animation */}
              <div className="w-7 h-11 rounded-full border-2 border-white/40 flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-white/60 rounded-full animate-scroll-wheel"></div>
              </div>
              <span className="text-white/40 text-[11px] tracking-wider uppercase">Scroll to zoom</span>
            </div>
          )}

          {/* Image */}
          <img
            src={lightboxSrc}
            alt={lightboxAlt}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();

        // H1 title — skip it (already shown in page header)
        if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
          return null;
        }

        // H2 section heading
        if (trimmed.startsWith("## ")) {
          h2Count++;
          isFirstParagraphInSection = true;
          const sectionImage = imageMap.get(h2Count);
          const floatSide = h2Count % 2 === 0 ? "left" : "right";

          return (
            <div key={index} className="clear-both">
              {/* Section divider */}
              <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-gray-800"></div>
                <span className="text-red-600 text-lg">✦</span>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                {trimmed.replace(/^##\s+/, "")}
              </h2>

              {/* Floated magazine image */}
              {sectionImage && (
                <div
                  className={`relative mb-4 ${
                    floatSide === "left"
                      ? "md:float-left md:mr-6 md:mb-4"
                      : "md:float-right md:ml-6 md:mb-4"
                  } w-full md:w-[45%] rounded-lg overflow-hidden border border-gray-800 shadow-[0_0_20px_rgba(220,38,38,0.08)] cursor-zoom-in group/img`}
                  onClick={() => openLightbox(sectionImage.filename, sectionImage.heading || "Story scene")}
                >
                  <img
                    src={sectionImage.filename}
                    alt={sectionImage.heading || "Story scene"}
                    className="w-full h-auto transition-transform duration-300 group-hover/img:scale-105"
                    loading="lazy"
                  />
                  {sectionImage.heading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                      <p className="text-gray-300 text-xs italic">{sectionImage.heading}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        // Regular paragraph
        const useDropCap = isFirstParagraphInSection;
        if (isFirstParagraphInSection) {
          isFirstParagraphInSection = false;
        }

        return (
          <p
            key={index}
            className={`text-gray-300 text-lg leading-[1.9] mb-5 ${useDropCap ? "drop-cap" : ""}`}
          >
            {paragraph}
          </p>
        );
      })}

      {/* Clear floats at the end */}
      <div className="clear-both"></div>
    </div>
  );
}
