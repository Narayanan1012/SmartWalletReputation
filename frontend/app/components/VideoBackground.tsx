"use client";

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// VideoBackground (PRD §6 — Cinematic Video Effects)
//
// Cinematic live-video environment.
// Falls back gracefully to a mechanical/industrial CSS
// animated texture if the video source is unavailable.
// ─────────────────────────────────────────────────────────

type Props = {
  // Optional video source. If none provided or fails to load,
  // the component falls back to the CSS animation.
  src?: string; 
};

export default function VideoBackground({ src = "/mangaatha-bg.mp4" }: Props) {
  const [videoError, setVideoError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch on initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-mangaatha-bg">
      {/* Video Layer */}
      {src && !videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          onError={() => setVideoError(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        /* CSS Fallback (Mechanical Vault / Radar sweep) */
        <div className="absolute inset-0 w-full h-full">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Radial dark gradient simulating a central focal point */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050608] via-transparent to-[#050608] opacity-80" />
          {/* Animated light sweep */}
          <div className="absolute inset-0 light-sweep opacity-20" />
        </div>
      )}

      {/* Dark Overlay (PRD requirement: "strong dark overlay so content remains readable") */}
      <div className="absolute inset-0 bg-mangaatha-bg/80 mix-blend-multiply" />
      
      {/* Second contrast/vignette overlay for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mangaatha-bg/50 to-mangaatha-bg" />
    </div>
  );
}
