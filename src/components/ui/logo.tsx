"use client";

import React from "react";

interface LogoProps {
  className?: string;
  iconSize?: number;
  showTagline?: boolean;
}

export const DezproxLogo = ({ className = "", iconSize = 42, showTagline = false }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Geometrically Perfect Ribbon Logo */}
      <svg
        width={iconSize}
        height={iconSize * (95 / 130)} // Keeps perfect aspect ratio matching the tight viewBox
        viewBox="35 55 130 95"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Rich gradient representing the brand colors */}
          <linearGradient id="brandGreenGrad" x1="45" y1="65" x2="155" y2="139" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" /> {/* Vibrant Lime-Green */}
            <stop offset="50%" stopColor="#22c55e" /> {/* Rich Green */}
            <stop offset="100%" stopColor="#15803d" /> {/* Deep Forest Green */}
          </linearGradient>

          {/* Shadow filter to give a premium 3D overlap feel */}
          <filter id="ribbonShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#14532d" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 1. Bottom Hill Ribbon (Base layer) */}
        <path
          d="M 45,100 
             L 45,124 
             C 45,134 52,139 63,139 
             L 75,139 
             C 90,139 90,89 100,89 
             C 110,89 110,139 125,139 
             L 155,139"
          stroke="url(#brandGreenGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Top Valley Ribbon (Middle layer with shadow) */}
        <path
          d="M 45,65 
             L 75,65 
             C 90,65 90,115 100,115 
             C 110,115 110,65 125,65 
             L 155,65"
          stroke="url(#brandGreenGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ribbonShadow)"
        />

        {/* 3. Overlap correction (Right side crossover: Hill Ribbon goes OVER Valley Ribbon) */}
        <path
          d="M 112,112
             C 116,125 120,139 125,139
             L 140,139"
          stroke="url(#brandGreenGrad)"
          strokeWidth="15"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span className="font-sans font-bold text-[24px] text-[#2c2e35] dark:text-[#111215] tracking-tight lowercase select-none">
          dezprox
        </span>
        {showTagline && (
          <span className="font-sans font-medium text-[9px] text-gray-400 uppercase tracking-[0.24em] mt-1.5 select-none font-semibold">
            Dream | Design | Deploy
          </span>
        )}
      </div>
    </div>
  );
};
