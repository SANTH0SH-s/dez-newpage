import * as React from "react";
import { twMerge } from "tailwind-merge";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={twMerge(
          "flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base transition-all duration-200 placeholder:text-gray-400 focus:border-dezprox-accent focus:outline-none focus:ring-4 focus:ring-dezprox-accent/10 disabled:cursor-not-allowed disabled:opacity-50 font-sans text-dezprox-text resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
