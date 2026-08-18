"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Portal Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center font-sans">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold text-dezprox-primary mb-2">Dashboard Error</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
        An error occurred while loading this administrative view. Please try reloading the dashboard.
      </p>
      <Button
        onClick={() => reset()}
        variant="outline"
        className="font-bold text-xs"
      >
        Retry Loading
      </Button>
    </div>
  );
}
