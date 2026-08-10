"use client";

import React from "react";

interface LogoProps {
  className?: string;
  iconSize?: number;
  showTagline?: boolean;
}

export const DezproxLogo = ({ className = "", iconSize = 42, showTagline = false }: LogoProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/logo.png" 
          alt="Dezprox" 
          style={{ height: `${iconSize}px`, width: 'auto' }}
          className="object-contain shrink-0"
        />
      </div>
      {showTagline && (
        <span className="font-sans font-medium text-[9px] text-gray-400 uppercase tracking-[0.24em] mt-1 select-none font-semibold pl-1">
          Dream | Design | Deploy
        </span>
      )}
    </div>
  );
};
