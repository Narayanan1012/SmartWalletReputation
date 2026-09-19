"use client";

import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────
// Golden Curves - Cinematic Background
// 
// Renders 3-7 non-parallel glowing golden threads that 
// drift organically across the screen.
// ─────────────────────────────────────────────────────────

export default function GoldenCurves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Handle resizing
    const resize = () => {
      // Use devicePixelRatio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    // Define 5 distinct curves. 
    // To ensure they are NEVER parallel, each curve has unique starting points, 
    // control points, and movement frequencies (using prime numbers to avoid syncing).
    const curves = [
      {
        p0: { x: -0.1, y: 0.2 },
        p1: { x: 0.5, y: 0.8 },
        p2: { x: 1.1, y: 0.1 },
        speed: 0.001,
        freq: [2.3, 3.1, 1.7, 2.9, 1.3, 3.7],
        width: 1.5,
        opacity: 0.6,
      },
      {
        p0: { x: 1.1, y: 0.4 },
        p1: { x: 0.4, y: 0.1 },
        p2: { x: -0.1, y: 0.9 },
        speed: 0.0012,
        freq: [3.1, 1.9, 2.7, 1.1, 3.3, 2.1],
        width: 2,
        opacity: 0.4,
      },
      {
        p0: { x: 0.2, y: -0.1 },
        p1: { x: 0.8, y: 0.5 },
        p2: { x: 0.1, y: 1.1 },
        speed: 0.0008,
        freq: [1.7, 2.3, 3.1, 1.9, 2.9, 1.1],
        width: 1,
        opacity: 0.8,
      },
      {
        p0: { x: -0.1, y: 0.7 },
        p1: { x: 0.6, y: -0.1 },
        p2: { x: 1.1, y: 0.6 },
        speed: 0.0015,
        freq: [2.9, 1.3, 1.7, 3.1, 2.3, 1.9],
        width: 2.5,
        opacity: 0.3,
      },
      {
        p0: { x: 0.9, y: 1.1 },
        p1: { x: 0.1, y: 0.9 },
        p2: { x: 0.8, y: -0.1 },
        speed: 0.0009,
        freq: [1.1, 2.9, 3.7, 1.3, 1.9, 2.3],
        width: 1.2,
        opacity: 0.7,
      }
    ];

    const render = () => {
      time += 1;
      
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear with transparent black for trailing effect, or just clear completely
      ctx.clearRect(0, 0, w, h);

      // We don't want a generic clearRect because we want clean lines.
      // Setup golden glow
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 20;

      curves.forEach((c) => {
        const t = time * c.speed;

        // Calculate dynamic points using sine waves so they drift organically
        // Multipliers and phase shifts ensure curves intersect and never run parallel
        const dx0 = Math.sin(t * c.freq[0]) * 0.2;
        const dy0 = Math.cos(t * c.freq[1]) * 0.2;
        
        const dx1 = Math.sin(t * c.freq[2]) * 0.4;
        const dy1 = Math.cos(t * c.freq[3]) * 0.4;
        
        const dx2 = Math.sin(t * c.freq[4]) * 0.2;
        const dy2 = Math.cos(t * c.freq[5]) * 0.2;

        const x0 = (c.p0.x + dx0) * w;
        const y0 = (c.p0.y + dy0) * h;
        
        const x1 = (c.p1.x + dx1) * w;
        const y1 = (c.p1.y + dy1) * h;
        
        const x2 = (c.p2.x + dx2) * w;
        const y2 = (c.p2.y + dy2) * h;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);

        // Core line
        ctx.strokeStyle = `rgba(255, 215, 0, ${c.opacity})`;
        ctx.lineWidth = c.width;
        ctx.stroke();

        // Inner bright core
        ctx.strokeStyle = `rgba(255, 255, 255, ${c.opacity * 0.8})`;
        ctx.lineWidth = c.width * 0.3;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020202]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen"
        style={{ filter: "blur(1px)" }} // Adds cinematic softness
      />
      {/* Subtle vignette to focus center and darken edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}
