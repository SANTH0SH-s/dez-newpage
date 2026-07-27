"use client";

import React, { useEffect, useRef, useState } from "react";

interface PremiumBackgroundProps {
  currentStep: number;
}

export const PremiumBackground = ({ currentStep }: PremiumBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isMouseActive, setIsMouseActive] = useState(false);

  // 1. Mouse Spotlight Tracker (optimized to update coordinates)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Adjust cursor position to center the spotlight element
      setMousePos({ x: e.clientX - 300, y: e.clientY - 300 });
      setIsMouseActive(true);
    };

    const handleMouseLeave = () => {
      setIsMouseActive(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 2. High-Performance Canvas Dot Particle Animation (Reduced Count for 60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Reduced count from 50 to 20 to drop calculation loops from 1,225 down to 190
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.8,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.06 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentStep]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-slate-50/40">
      
      {/* A. Grid Blueprint Pattern with Center Fade (uses simple layout) */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #22c55e 1px, transparent 1px),
            linear-gradient(to bottom, #22c55e 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      {/* B. Floating Aurora Blurs (with will-change: transform to enable GPU/Hardware Acceleration) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/6 blur-[120px] animate-float-slow will-change-transform" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/4 blur-[130px] animate-float-slower will-change-transform" />
      <div className="absolute top-[40%] left-[25%] w-[35%] h-[35%] rounded-full bg-indigo-500/2 blur-[110px] animate-float-slow will-change-transform" />

      {/* C. Hardware-Accelerated Mouse Spotlight */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-radial from-emerald-500/5 to-transparent blur-[60px] transition-opacity duration-300 ease-out will-change-transform"
        style={{
          opacity: isMouseActive ? 1 : 0,
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      />

      {/* D. Noise Overlay (Micro-texture) */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* E. Interactive Particle Dot Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />
    </div>
  );
};
