"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in a real application
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-dezprox-primary mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          We apologize for the inconvenience. A technical issue has occurred while loading this page. Our team has been notified.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="font-bold text-xs"
          >
            Reload Page
          </Button>
          <Button
            onClick={() => reset()}
            variant="accent"
            className="font-bold text-xs"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
