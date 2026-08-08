"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
  return (
    <div className="relative w-full overflow-hidden bg-transparent py-16 md:py-24 px-4 max-w-[1280px] mx-auto min-h-[85vh] flex items-center justify-center">

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="relative w-full max-w-4xl border border-dezprox-accent/25 p-12 md:p-20 text-center bg-white/70 backdrop-blur-[2px] rounded-sm">
          <div className="absolute left-[-6px] top-[-6px] h-3 w-3 bg-dezprox-accent rounded-sm" />
          <div className="absolute right-[-6px] top-[-6px] h-3 w-3 bg-dezprox-accent rounded-sm" />
          <div className="absolute bottom-[-6px] left-[-6px] h-3 w-3 bg-dezprox-accent rounded-sm" />
          <div className="absolute bottom-[-6px] right-[-6px] h-3 w-3 bg-dezprox-accent rounded-sm" />

          <div className="inline-flex items-center space-x-2 bg-dezprox-accent/10 border border-dezprox-accent/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-dezprox-accent" />
            <span className="text-xs font-bold font-sans uppercase tracking-widest text-dezprox-primary">
              Dynamic Pricing CMS Platform
            </span>
          </div>

          <h1 className="text-[36px] md:text-[44px] font-extrabold leading-[45px] md:leading-[52px] text-dezprox-primary tracking-tight font-sans max-w-2xl mx-auto">
            Designing the Future, <br />
            <span className="text-dezprox-accent">One Pixel & Line of Code</span> <br />
            at a Time!
          </h1>

          <p className="mt-8 text-base font-sans text-dezprox-text/60 max-w-xl mx-auto leading-relaxed">
            Configure project specifications dynamically to generate a precise cost estimation. Replicating the state-of-the-art interactive CMS visual standards.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="accent"
              onClick={onStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 group cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            
            <a 
              href="https://www.dezprox.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
              >
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
