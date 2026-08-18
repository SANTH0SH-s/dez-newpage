import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dezprox-primary mb-4" />
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
          Loading...
        </span>
      </div>
    </div>
  );
}
