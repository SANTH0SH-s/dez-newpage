import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4 max-w-[1280px] mx-auto">
      {/* Branding Tagline */}
      <div className="inline-flex items-center space-x-2 bg-dezprox-accent/10 border border-dezprox-accent/20 rounded-full px-4 py-2 mb-6">
        <Sparkles className="w-4 h-4 text-dezprox-primary animate-pulse" />
        <span className="text-sm font-semibold font-sans uppercase tracking-widest text-dezprox-primary">
          Dezprox Interactive CMS Platform
        </span>
      </div>

      {/* Main Hero Heading */}
      <h1 className="text-[36px] font-bold leading-[45px] text-dezprox-primary tracking-tight max-w-4xl font-sans">
        Dynamic Service Pricing & Estimation CMS Platform
      </h1>

      {/* Hero Description */}
      <p className="mt-6 text-base font-sans text-gray-500 max-w-2xl leading-relaxed">
        Select services and configure requirements in real-time to generate a detailed cost estimate for your next project. Tailored for transparency, built for speed.
      </p>

      {/* CTA Button */}
      <div className="mt-10">
        <Button 
          variant="primary" 
          onClick={onStart}
          className="flex items-center gap-2 group shadow-sm hover:shadow-lg"
        >
          Begin Dynamic Estimation
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Design System Visual Cue */}
      <div className="mt-16 w-full max-w-lg border border-gray-100/50 rounded-2xl p-4 bg-gray-50/50 flex justify-around items-center text-xs text-gray-400 font-sans font-semibold">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-dezprox-accent" /> Custom OKLCH Accent
        </span>
        <span className="h-4 w-px bg-gray-200" />
        <span>Outfit Sans Font Family</span>
        <span className="h-4 w-px bg-gray-200" />
        <span>Full WCAG AAA Compliant</span>
      </div>
    </div>
  );
};
