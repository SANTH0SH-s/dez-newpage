import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost";
  size?: "default" | "sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        className={twMerge(
          "inline-flex items-center justify-center font-sans font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dezprox-accent/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          // Variants
          variant === "primary" && "bg-dezprox-primary text-white hover:bg-dezprox-primary/95 hover:-translate-y-0.5 hover:shadow-card-hover",
          variant === "accent" && "bg-dezprox-accent text-dezprox-primary hover:bg-dezprox-accent/95 hover:-translate-y-0.5 hover:shadow-card-hover",
          variant === "outline" && "border-2 border-dezprox-primary text-dezprox-primary bg-transparent hover:bg-dezprox-primary hover:text-white hover:-translate-y-0.5",
          variant === "ghost" && "text-dezprox-primary bg-transparent hover:bg-dezprox-primary/5",
          // Sizes
          size === "default" && "h-14 px-14 rounded-btn text-base",
          size === "sm" && "h-10 px-6 rounded-btn text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
