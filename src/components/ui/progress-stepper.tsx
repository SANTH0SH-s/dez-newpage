import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Check } from "lucide-react";

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export const ProgressStepper = ({ steps, currentStep, onStepClick }: ProgressStepperProps) => {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative w-full px-4">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        
        {/* Active Line Progress */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-dezprox-primary -translate-y-1/2 transition-all duration-500 ease-in-out z-0" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          
          return (
            <button
              key={step}
              onClick={() => onStepClick && isCompleted && onStepClick(idx)}
              disabled={!onStepClick || !isCompleted}
              className="relative flex flex-col items-center group z-10 focus:outline-none disabled:cursor-default"
            >
              <div 
                className={twMerge(
                  "w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold text-sm border-2 transition-all duration-300",
                  isCompleted 
                    ? "bg-dezprox-primary border-dezprox-primary text-white" 
                    : isActive 
                      ? "bg-white border-dezprox-accent text-dezprox-primary shadow-lg scale-110" 
                      : "bg-white border-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  idx + 1
                )}
              </div>
              <span 
                className={twMerge(
                  "mt-3 text-xs font-semibold font-sans tracking-wide transition-all duration-300",
                  isActive && "text-dezprox-primary font-bold",
                  isCompleted && "text-dezprox-primary/75 group-hover:text-dezprox-primary",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {step}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden px-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-bold text-dezprox-primary font-sans">
            {steps[currentStep]}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-dezprox-accent h-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
