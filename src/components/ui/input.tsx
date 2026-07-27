import * as React from "react";
import { twMerge } from "tailwind-merge";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          "flex w-full rounded-xl border border-gray-200 bg-white px-4 h-12 text-base transition-all duration-200 placeholder:text-gray-400 focus:border-dezprox-accent focus:outline-none focus:ring-4 focus:ring-dezprox-accent/10 disabled:cursor-not-allowed disabled:opacity-50 font-sans text-dezprox-text",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
