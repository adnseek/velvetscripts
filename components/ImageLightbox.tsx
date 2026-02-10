"use client";

import { useState } from "react";

export function LightboxImage({ src, alt, className, children }: {
  src: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const closeLightbox = () => {
    setOpen(false);
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
    <>
      <div className={className} onClick={() => setOpen(true)}>
        {children}
      </div>

      {open && (
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
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light z-10 w-10 h-10 flex items-center justify-center bg-black/50 rounded-full"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
          >
            ✕
          </button>

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

          {zoom === 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-hint">
              <div className="w-7 h-11 rounded-full border-2 border-white/40 flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-white/60 rounded-full animate-scroll-wheel"></div>
              </div>
              <span className="text-white/40 text-[11px] tracking-wider uppercase">Scroll to zoom</span>
            </div>
          )}

          <img
            src={src}
            alt={alt}
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
    </>
  );
}
